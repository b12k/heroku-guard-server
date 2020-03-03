import http from 'http';
import express, { json } from 'express';
import cookie from 'cookie-parser';
import nunjukcs from 'nunjucks';

import { connectDatabase } from './models';
import {
  api,
  activationController,
  rootController,
} from './controllers';

(async (): Promise<http.Server> => {
  const {
    env: {
      PORT,
      SERVER_ENV,
    },
  } = process;
  const isProduction = SERVER_ENV !== 'development';
  const server = express();

  await connectDatabase(isProduction);

  nunjukcs.configure('./views', {
    express: server,
    autoescape: true,
  });

  return server
    .set('view engine', 'njk')
    .use(cookie())
    .use(json())
    .use('/api', api)
    .use('/activate', activationController)
    .get('/', rootController)
    .listen(PORT, () => console.log(`http://localhost:${PORT}`));
})();
