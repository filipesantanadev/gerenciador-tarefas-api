import type {
  AdvancedFilterParams,
  TasksRepository,
  TaskWithRelations,
} from '@/repositories/tasks-repository.ts'

interface FilterTasksUseCaseRequest {
  userId: string

  // Basic filters
  title?: string
  status?: string
  categoryId?: string
  priority?: string
  tagIds?: string[]

  // Date range filters
  dueDateFrom?: Date
  dueDateTo?: Date
  createdAfter?: Date
  createdBefore?: Date

  // Additional filters
  includeArchived?: boolean
  hasDescription?: boolean
  overdue?: boolean

  // Sorting
  orderBy?: 'createdAt' | 'dueDate' | 'priority' | 'title'
  order?: 'asc' | 'desc'

  // Pagination
  page?: number
}

interface FilterTaskUseCaseResponse {
  tasks: TaskWithRelations[]
  totalCount: number
  appliedFilters: string[]
}

export class FilterTasksUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute(
    request: FilterTasksUseCaseRequest,
  ): Promise<FilterTaskUseCaseResponse> {
    const {
      userId,
      title,
      status,
      categoryId,
      priority,
      tagIds,
      dueDateFrom,
      dueDateTo,
      createdAfter,
      createdBefore,
      includeArchived = false,
      hasDescription,
      overdue,
      orderBy = 'createdAt',
      order = 'desc',
      page = 1,
    } = request

    const advancedParams: AdvancedFilterParams = {
      userId,
      ...(title && { title }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(priority && { priority }),
      ...(tagIds && { tagIds }),
      includeArchived,
      orderBy,
      order,
      page,
      ...(dueDateFrom && { dueDateFrom }),
      ...(dueDateTo && { dueDateTo }),
      ...(createdAfter && { createdAfter }),
      ...(createdBefore && { createdBefore }),
      ...(hasDescription !== undefined && { hasDescription }),
      ...(overdue && { overdue }),
    }

    const tasks =
      await this.tasksRepository.findManyWithAdvanceFilters(advancedParams)

    const appliedFilters = this.buildAppliedFiltersList(request)

    return {
      tasks,
      totalCount: tasks.length,
      appliedFilters,
    }
  }

  // -------------------------
  // Private helper
  // Builds a list of human-readable strings representing the applied filters
  // for easy display in the UI
  // Example: ["Status: completed", "Priority: high", "Due before: 2023-12-31"
  // -------------------------
  private buildAppliedFiltersList(
    request: FilterTasksUseCaseRequest,
  ): string[] {
    const filters: string[] = []

    if (request.title) filters.push(`Title: ${request.title}`)
    if (request.status) filters.push(`Status: ${request.status}`)
    if (request.categoryId) filters.push(`Category ID: ${request.categoryId}`)
    if (request.priority) filters.push(`Priority: ${request.priority}`)
    if (request.tagIds?.length)
      filters.push(`Tags: ${request.tagIds.length} selected`)
    if (request.dueDateFrom)
      filters.push(`Due after: ${request.dueDateFrom.toDateString()}`)
    if (request.dueDateTo)
      filters.push(`Due before: ${request.dueDateTo.toDateString()}`)
    if (request.createdAfter)
      filters.push(`Created after: ${request.createdAfter.toDateString()}`)
    if (request.createdBefore)
      filters.push(`Created before: ${request.createdBefore.toDateString()}`)
    if (request.hasDescription !== undefined)
      filters.push(
        request.hasDescription ? 'Has description' : 'No description',
      )
    if (request.overdue) filters.push('Overdue tasks')
    if (request.includeArchived) filters.push('Including archived')

    return filters
  }
}
