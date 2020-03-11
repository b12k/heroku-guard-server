import { User } from '../models';
import {
  ErrorUserNotActive,
  ErrorUserNotFound,
  ErrorUserWrongPassword,
  hashString,
} from '../helpers';


export default async (email: string, password: string): Promise<User> | never => {
  const user = await User.findOne({ email });

  if (user === undefined) {
    throw new ErrorUserNotFound();
  }
  if (!user.isActive) {
    throw new ErrorUserNotActive();
  }
  if (user.password !== hashString(password)) {
    throw new ErrorUserWrongPassword();
  }

  return user;
};
