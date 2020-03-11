import http from 'http';
import express, {
  static as serveStatic,
  urlencoded,
} from 'express';
import cookie from 'cookie-parser';
import nunjukcs from 'nunjucks';
import { resolve } from 'path';

import { connectDatabase } from './models';
import controllers from './controllers';
import { required } from './helpers';

(async (): Promise<http.Server> => {
  const {
    env: {
      PORT = required('PORT'),
      SERVER_ENV = required('SERVER_ENV'),
      APP_NAME = required('APP_NAME'),
      RECAPTCHA_SERVER_KEY = required('RECAPTCHA_SERVER_KEY'),
      RECAPTCHA_CLIENT_KEY = required('RECAPTCHA_CLIENT_KEY'),
    },
  } = process;
  const isProduction = SERVER_ENV !== 'development';
  const server = express();

  await connectDatabase(isProduction);

  nunjukcs
    .configure(resolve(__dirname, './views'), {
      express: server,
      autoescape: true,
    })
    .addGlobal('env', {
      APP_NAME,
      RECAPTCHA_SERVER_KEY,
      RECAPTCHA_CLIENT_KEY,
    });

  return server
    .set('view engine', 'njk')
    .use(cookie())
    .use(urlencoded({ extended: true }))
    .use('/', serveStatic(resolve(__dirname, './public')))
    .use('/', controllers)
    // .get('/login/:activationCode', loginController)
    // .get('/logout', logoutController)
    // .post('/register', registrationController)
    // .post('/login', loginController)
    // .post('/test', (request, response) => {
    //   const {
    //     body,
    //   } = request;
    //   return response.json(body);
    // })
    .listen(PORT, () => console.log(`http://localhost:${PORT}`));
})();
