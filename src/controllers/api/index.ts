import { Router } from 'express';

import userController from './userController';

const api = Router();

api
  .use('/users', userController);

export default api;
