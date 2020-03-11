import * as Yup from 'yup';
import axios from 'axios';

import { required } from '../helpers';
import { User } from '../models';

const {
  env: {
    RECAPTCHA_SERVER_KEY = required('RECAPTCHA_SERVER_KEY'),
  },
} = process;

type TFormData = {
  email: string;
  password: string;
  action: 'login' | 'register';
  captcha: string;
};

export default (data: TFormData): Promise<object> => {
  const schema = Yup
    .object()
    .shape({
      email: Yup
        .string()
        .required('Email is required.')
        .email('Email must be valid.')
        .test('uniqueEmail', 'User with this email already exists', async (email) => {
          if (data.action === 'login') return true;
          const user = await User.findOne({ email });
          return user === undefined;
        }),
      password: Yup
        .string()
        .required('Password is required.')
        .min(6, 'Password must be at least 6 symbols.'),
      action: Yup
        .string()
        .required('Action is required.'),
      captcha: Yup
        .string()
        .required('Hmmmm. Captcha is missing.')
        .test('grecaptcha', 'Are you a robot?', async (value) => {
          const isVerified = await axios
            .post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SERVER_KEY}&response=${value}`)
            .then((response) => response.data.success)
            .catch(() => false);
          return isVerified;
        }),
    });

  return schema
    .validate(data, {
      abortEarly: false,
    });
};
