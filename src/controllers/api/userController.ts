import {
  Request,
  Response,
  Router,
} from 'express';
import * as Yup from 'yup';
import { v4 as uuid } from 'uuid';

import { User } from '../../models';
import { sendMail } from '../../services';
import { required } from '../../helpers';

type TStatusMessage = {
  message: string;
  status: 'success' | 'warning' | 'danger';
};

const {
  env: {
    WHITE_LISTED_EMAIL_DOMAINS = required('WHITE_LISTED_EMAIL_DOMAINS'),
    APP_NAME = required('APP_NAME'),
  },
} = process;

const whiteListedEmailDomains = WHITE_LISTED_EMAIL_DOMAINS.split(',');

const newUserSchema = Yup
  .object()
  .shape({
    email: Yup
      .string()
      .email()
      .required(),
    password: Yup
      .string()
      .min(6)
      .required(),
    passwordConfirmation: Yup
      .string()
      .oneOf([Yup.ref('password'), null])
      .required(),
  });

export default Router()
  .post('/', async (request: Request, response: Response): Promise<Response> => {
    try {
      await newUserSchema.validate(request.body);
    } catch (error) {
      return response
        .status(403)
        .json(error.errors);
    }

    const {
      body: {
        email,
        password,
      },
      hostname,
      protocol,
    } = request;

    const existingUser = await User.findOne({ email });
    const payload: TStatusMessage = {
      message: 'User with this email already exist.',
      status: 'danger',
    };

    if (existingUser) {
      response.status(409);
    } else {
      const user: User = new User();
      user.email = email;
      user.password = password;
      user.activationCode = uuid();
      await user.save();

      if (!whiteListedEmailDomains.some((domain) => user.email.includes(domain))) {
        payload.message = 'Your email requires manual activation. Please contact development team member.';
        payload.status = 'warning';
      } else {
        await sendMail({
          to: user.email,
          subject: `[${APP_NAME}] User activation`,
          html: `
          <p>
            <strong>
                User activation
            </strong>
          </p>
          <p>
            To activate your user please click
            <strong>
                <a href="${protocol}://${hostname}/activate/${user.activationCode}" target="_blank">
                    HERE
                </a>
            </strong>
          </p>
        `,
        });
        payload.message = 'Activation Email sent. Check your inbox.';
        payload.status = 'success';
      }
    }

    return response.json(payload);
  });
