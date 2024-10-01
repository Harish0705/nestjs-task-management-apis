import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './tasks-status.enum';
import { Task } from './tasks.entity';

export interface TasksRepository extends Repository<Task> {
  this: Repository<Task>;
  getTasks(filterDto: GetTasksFilterDto): Promise<Task[]>;
  createTask(createTaskDto: CreateTaskDto);
}

export const customTaskRepository: Pick<TasksRepository, any> = {
  async getTasks(
    this: Repository<Task>,
    filterDto: GetTasksFilterDto,
  ): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');

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
  ): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.save(task);
    return task;
  },
};
