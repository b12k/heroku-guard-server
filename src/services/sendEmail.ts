import {
  createTransport,
  SentMessageInfo,
} from 'nodemailer';

import { required } from '../helpers';

const {
  env: {
    NODEMAILER_SMTP_URL = required('NODEMAILER_SMTP_URL'),
    NODEMAILER_FROM = required('NODEMAILER_FROM'),
  },
} = process;

const mailer = createTransport(NODEMAILER_SMTP_URL);

type Message = {
  html: string;
  to: string;
  subject: string;
};

export default (message: Message): Promise<SentMessageInfo> => mailer.sendMail({
  from: NODEMAILER_FROM,
  ...message,
});
