import { Module } from '@nestjs/common';
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TasksController } from './tasks.controller';
import { customTaskRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [
    {
      provide: getRepositoryToken(Task),
      inject: [getDataSourceToken()],
      useFactory(datasource: DataSource) {
        return datasource.getRepository(Task).extend(customTaskRepository);
      },
    },
    TasksService,
  ],
})
export class TasksModule {}
