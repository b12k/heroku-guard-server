import {
  Request,
  Response,
} from 'express';
import { v4 as uuid } from 'uuid';
import { ValidationError } from 'yup';

import { User } from '../models';
import {
  validateForm,
  sendMail,
  generateUserToken,
  validateUser,
} from '../services';
import {
  required,
  getCookieDomain,
  ErrorFormUnknownAction,
} from '../helpers';

const {
  env: {
    GUARD_COOKIE_NAME = required('GUARD_COOKIE_NAME'),
  },
} = process;

const {
  env: {
    WHITE_LISTED_EMAIL_DOMAINS = required('WHITE_LISTED_EMAIL_DOMAINS'),
    PORT = required('PORT'),
    APP_NAME = required('APP_NAME'),
  },
} = process;
const whiteListedEmailDomains = WHITE_LISTED_EMAIL_DOMAINS.split(',');

const register = async (request: Request, response: Response): Promise<void> => {
  const {
    body: {
      email,
      password,
    },
    protocol,
  } = request;
  const hostname = request.hostname === 'localhost'
    ? `${request.hostname}:${PORT}`
    : request.hostname;
  const canActivate = whiteListedEmailDomains
    .some((domain) => email.includes(domain));

  const user: User = new User();
  user.email = email;
  user.password = password;
  user.activationCode = uuid();
  await user.save();

  if (canActivate) {
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
              <a href="${protocol}://${hostname}/${user.activationCode}" target="_blank">
                  HERE
              </a>
          </strong>
        </p>
      `,
    });
    return response.render('index', {
      alert: {
        title: 'Success',
        class: 'success',
        text: 'You need to activate your account. Check your inbox for activation email.',
      },
    });
  }

  return response.render('index', {
    alert: {
      title: 'Warning',
      class: 'warning',
      text: 'Your email requires manual activation. Please contact development team member.',
    },
  });
};

const login = async (request: Request, response: Response): Promise<void> => {
  const {
    body: {
      email,
      password,
    },
    hostname,
  } = request;

  const user = await validateUser(email, password);
  const token = await generateUserToken(user);

  return response
    .cookie(GUARD_COOKIE_NAME, token.value, {
      domain: getCookieDomain(hostname),
      expires: token.expiresAt,
    })
    .redirect(302, '/');
};

export default async (request: Request, response: Response): Promise<void> => {
  const { body } = request;

  try {
    await validateForm(body);
  } catch (error) {
    console.log(error instanceof ValidationError);
    return response
      .status(403)
      .render('index', {
        alert: {
          title: 'Error',
          class: 'danger',
          text: 'You have validation errors:',
          errors: error.errors,
        },
      });
  }
  switch (body.action) {
    case 'register':
      return register(request, response);
    case 'login':
      return login(request, response);
    default:
      throw new ErrorFormUnknownAction();
  }
};
