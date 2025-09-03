import type {
  FindManyParams,
  TasksRepository,
  TaskWithRelations,
} from '@/repositories/tasks-repository.ts'

interface ListTasksUseCaseResponse {
  tasks: TaskWithRelations[]
}

export class ListTasksUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute(params: FindManyParams): Promise<ListTasksUseCaseResponse> {
    const tasks = await this.tasksRepository.findMany(params)

    return { tasks }
  }
}
