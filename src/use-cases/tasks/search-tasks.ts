import type {
  SearchTasksParams,
  TasksRepository,
  TaskWithRelations,
} from '@/repositories/tasks-repository.ts'

interface SearchTasksUseCaseRequest {
  query: string
  userId: string
  page?: number
}

interface SearchTasksUseCaseResponse {
  tasks: TaskWithRelations[]
}

export class SearchTasksUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    query,
    userId,
    page = 1,
  }: SearchTasksUseCaseRequest): Promise<SearchTasksUseCaseResponse> {
    if (!query || query.trim().length < 2) {
      return { tasks: [] }
    }

    const params: SearchTasksParams = {
      userId,
      query: query.trim(),
      page,
      includeArchived: false,
    }

    const tasks = await this.tasksRepository.searchByText(params)

    return { tasks }
  }
}
