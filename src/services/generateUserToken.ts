import { v4 as uuid } from 'uuid';
import { addDays } from 'date-fns';

import {
  Token,
  User,
} from '../models';
import { required } from '../helpers';

const {
  env: {
    GUARD_COOKIE_TTL_DAYS = required('GUARD_COOKIE_TTL_DAYS'),
  },
} = process;

export default async (user: User): Promise<Token> => {
  const token = new Token();
  token.value = uuid();
  token.expiresAt = addDays(new Date(), Number(GUARD_COOKIE_TTL_DAYS));
  await token.save();

  // eslint-disable-next-line no-param-reassign
  user.tokens = [token];
  await user.save();

  return token;
};
