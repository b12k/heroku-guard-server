import {
  Request,
  Response,
} from 'express';
import { addDays } from 'date-fns';

import { required } from '../helpers';
import { validateToken } from '../services';

const {
  env: {
    GUARD_COOKIE_TTL_DAYS = required('GUARD_COOKIE_TTL_DAYS'),
  },
} = process;

export default async (request: Request, response: Response): Promise<Response> => {
  const {
    params: {
      accessToken,
    },
  } = request;

  const token = await validateToken(accessToken);

  token.expiresAt = addDays(token.expiresAt, Number(GUARD_COOKIE_TTL_DAYS));
  await token.save();

  return response.json('OK');
};
