import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

// eslint-disable-next-line import/no-cycle
import User from './user';

@Entity()
export default class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    (type) => User,
    (user) => user.tokens,
    { onDelete: 'CASCADE' },
  )
  user: User;

  @Column({
    unique: true,
  })
  value: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
