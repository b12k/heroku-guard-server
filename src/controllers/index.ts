import { Router } from 'express';

import activationController from './activationController';
import logoutController from './logoutController';
import rootController from './rootController';
import authorizeController from './authorizeController';
import validationController from './validationController';

export default Router()
  .get('/', rootController)
  .get('/logout', logoutController)
  .get('/:activationCode', activationController)
  .post('/', authorizeController)
  .post('/:accessToken', validationController);
