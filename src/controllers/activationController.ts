import {
  Request,
  Response,
} from 'express';

import { User } from '../models';
import { generateUserToken } from '../services';
import {
  required,
  ErrorUserNotFound,
  getCookieDomain,
} from '../helpers';

const {
  env: {
    GUARD_COOKIE_NAME = required('GUARD_COOKIE_NAME'),
  },
} = process;

export default async (request: Request, response: Response): Promise<void> => {
  const {
    params: {
      activationCode,
    },
    hostname,
  } = request;

  const user = await User.findOne({ activationCode });
  if (user === undefined) throw new ErrorUserNotFound();
  user.isActive = true;
  await user.save();

  const token = await generateUserToken(user);

  return response
    .cookie(GUARD_COOKIE_NAME, token.value, {
      domain: getCookieDomain(hostname),
      expires: token.expiresAt,
    })
    .redirect(302, '/');
};
