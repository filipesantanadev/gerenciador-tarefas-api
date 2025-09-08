import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import type { Task } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'

interface FetchTasksByCategoryUseCaseRequest {
  categoryId: string
}

interface FetchTasksByCategoryUseCaseResponse {
  tasks: Task[]
}

export class FetchTasksByCategoryUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private categoriesRepository: CategoriesRepository,
  ) {}

  async execute({
    categoryId,
  }: FetchTasksByCategoryUseCaseRequest): Promise<FetchTasksByCategoryUseCaseResponse> {
    if (!categoryId) {
      throw new ResourceNotFoundError()
    }

    const category = await this.categoriesRepository.findById(categoryId)

    if (!category) {
      throw new ResourceNotFoundError()
    }

    const tasksByCategory =
      await this.tasksRepository.findManyByCategoryId(categoryId)

    return { tasks: tasksByCategory }
  }
}
