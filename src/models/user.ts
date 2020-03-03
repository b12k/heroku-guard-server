import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

// eslint-disable-next-line import/no-cycle
import Token from './token';
import { hashString } from '../helpers';

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    nullable: false,
    name: 'password',
  })
  private pwd: string;

  get password(): string {
    return this.pwd;
  }

  set password(value: string) {
    this.pwd = hashString(value);
  }

  @OneToMany(
    (type) => Token,
    (token: Token) => token.user,
  )
  tokens: Token[];

  @Column({
    nullable: false,
    default: false,
  })
  isActive: boolean;

  @Column({
    unique: true,
    nullable: true,
  })
  activationCode: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
