import { isFuture } from 'date-fns';

import { Token } from '../models';
import {
  ErrorTokenExpired,
  ErrorTokenNotFound,
  ErrorUserNotActive,
} from '../helpers';

export default async (value: string): Promise<Token> | never => {
  const token = await Token.findOne({ value });
  if (token === undefined) throw new ErrorTokenNotFound();
  if (!isFuture(token.expiresAt)) {
    await token.remove();
    throw new ErrorTokenExpired();
  }
  if (!token.user.isActive) throw new ErrorUserNotActive();

  return token;
};
