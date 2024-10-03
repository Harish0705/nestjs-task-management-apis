import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './tasks-status.enum';
import { Task } from './tasks.entity';
import { User } from 'src/auth/user.entity';
import { NotFoundException } from '@nestjs/common';

export interface TasksRepository extends Repository<Task> {
  this: Repository<Task>;
  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>;
  createTask(createTaskDto: CreateTaskDto, user: User);
  deleteTask(id: string, user: User);
}

export const customTaskRepository: Pick<TasksRepository, any> = {
  async getTasks(
    this: Repository<Task>,
    filterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  },

  async createTask(
    this: Repository<Task>,
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);
    return task;
  },

  async deleteTask(
    this: Repository<Task>,
    id: string,
    user: User,
  ): Promise<void> {
    const query = this.createQueryBuilder('task');
    const task = await query.where({ id, user }).getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    const result = await query
      .delete()
      .from(Task)
      .where('id = :id', { id })
      .execute();
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  },
};
