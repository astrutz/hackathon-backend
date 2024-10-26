import { Controller, Post } from '@nestjs/common';
import { TasksService } from '../services/tasks.service';

@Controller("/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {
  }

  @Post()
  triggerWeeklyScoreSaving(): void {
    this.tasksService.saveWeeklyScore();
  }
}
