/* eslint-disable @typescript-eslint/no-unused-vars */
import { Task } from 'src/tasks/tasks.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-roles.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    select: true,
  })
  role: UserRole;

  @OneToMany((_type) => Task, (task) => task.user, { eager: true })
  tasks: Task[];
}
