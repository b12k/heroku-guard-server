import {
  Request,
  Response,
  Router,
} from 'express';
import { v4 as uuid } from 'uuid';
import { addDays } from 'date-fns';
import parseDomain from 'parse-domain';

import {
  User,
  Token,
} from '../models';
import { required } from '../helpers';

const {
  env: {
    GUARD_COOKIE_NAME = required('GUARD_COOKIE_NAME'),
    GUARD_COOKIE_TTL_DAYS = required('GUARD_COOKIE_TTL_DAYS'),
  },
} = process;

export default Router()
  .get('/:activationCode', async (request: Request, response: Response): Promise<Response | void> => {
    const {
      params: {
        activationCode,
      },
      hostname,
    } = request;

    const user: User | undefined = await User.findOne({ activationCode });
    if (!user) return response.status(404).send('Not Found');
    if (user.isActive) return response.status(403).send('Already Activated');

    let cookieDomain = hostname;
    const parsedHostname = parseDomain(hostname);
    if (parsedHostname) {
      cookieDomain = `.${parsedHostname.domain}.${parsedHostname.tld}`;
    }
    const token = new Token();
    token.value = uuid();
    token.expiresAt = addDays(new Date(), Number(GUARD_COOKIE_TTL_DAYS));
    await token.save();

    user.isActive = true;
    user.tokens = [token];
    await user.save();

    return response
      .cookie(GUARD_COOKIE_NAME, token.value, {
        domain: cookieDomain,
        expires: token.expiresAt,
      })
      .redirect(302, '/?activated=true');
  });
