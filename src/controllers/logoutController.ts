import {
  Request,
  Response,
} from 'express';

import { required } from '../helpers';

const {
  env: {
    GUARD_COOKIE_NAME = required('GUARD_COOKIE_NAME'),
  },
} = process;

export default (request: Request, response: Response): void => response
  .clearCookie(GUARD_COOKIE_NAME)
  .redirect(302, '/');
