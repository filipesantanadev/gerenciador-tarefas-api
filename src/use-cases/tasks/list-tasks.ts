import type {
  FindManyParams,
  TasksRepository,
} from '@/repositories/tasks-repository.ts'
import type { Task } from 'generated/prisma/index.js'

interface ListTasksUseCaseResponse {
  tasks: Task[]
}

export class ListTasksUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute(params: FindManyParams): Promise<ListTasksUseCaseResponse> {
    const tasks = await this.tasksRepository.findMany(params)

    return { tasks }
  }
}
