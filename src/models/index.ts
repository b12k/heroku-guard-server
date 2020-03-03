import 'reflect-metadata';
import {
  Connection,
  createConnection,
} from 'typeorm';

import User from './user';
import Token from './token';
import { required } from '../helpers';

const {
  env: {
    DATABASE_URL = required('DATABASE_URL'),
  },
} = process;

const connectDatabase = (isProduction = true): Promise<Connection> => createConnection({
  type: 'postgres',
  url: DATABASE_URL,
  entities: [
    User,
    Token,
  ],
  synchronize: !isProduction,
});

export {
  User,
  Token,
  connectDatabase,
};
