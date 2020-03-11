import {
  Request,
  Response,
} from 'express';

import { required } from '../helpers';
import { validateToken } from '../services';

const {
  env: {
    GUARD_COOKIE_NAME = required('GUARD_COOKIE_NAME'),
  },
} = process;

export default async (request: Request, response: Response): Promise<Response|void> => {
  const {
    cookies: {
      [GUARD_COOKIE_NAME]: token,
    },
  } = request;

  if (token === undefined) {
    return response
      .render('index');
  }

  await validateToken(token);

  return response
    .render('index', {
      alert: {
        title: 'Yey!',
        class: 'info',
        text: 'You have access.',
      },
      hasAccess: true,
    });
};
