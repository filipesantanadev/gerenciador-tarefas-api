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
  totalCount: number
}

export class SearchTasksUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    query,
    userId,
    page = 1,
  }: SearchTasksUseCaseRequest): Promise<SearchTasksUseCaseResponse> {
    const trimmedQuery = query?.trim()

    if (!trimmedQuery || trimmedQuery.length < 2) {
      return { tasks: [], totalCount: 0 }
    }

    const params: SearchTasksParams = {
      userId,
      query: trimmedQuery,
      page,
      includeArchived: false,
    }

    const { tasks, totalCount } =
      await this.tasksRepository.searchByText(params)

    return { tasks, totalCount }
  }
}
