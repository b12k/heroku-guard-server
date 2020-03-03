import crypto from 'crypto';

import required from './required';

const {
  env: {
    SECRET = required('SECRET'),
  },
} = process;

export default (string: string): string => crypto
  .createHash('sha256')
  .update(`${string}.${SECRET}`)
  .digest('hex');
