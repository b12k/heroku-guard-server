import {
  Request,
  Response,
} from 'express';

export default (request: Request, response: Response): Response => response
  .send('It works');
