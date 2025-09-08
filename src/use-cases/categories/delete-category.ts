import type { Category } from 'generated/prisma/index.js'
import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import { InvalidDeleteDataError } from '../errors/invalid-delete-data-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

interface DeleteCategoryUseCaseRequest {
  id: string
  userId: string
}

interface DeleteCategoryUseCaseResponse {
  category: Category | null
}

export class DeleteCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private usersRepository: UsersRepository,
    private tasksRepository: TasksRepository,
  ) {}

  async execute({
    id,
    userId,
  }: DeleteCategoryUseCaseRequest): Promise<DeleteCategoryUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const category = await this.categoriesRepository.findById(id)

    if (!category) {
      throw new ResourceNotFoundError()
    }

    if (category.user_id !== userId) {
      throw new UnauthorizedError()
    }

    const tasks = await this.tasksRepository.findManyByCategoryId(id)
    if (tasks.length > 0) {
      // TODO: Implementar depois o 'Soft Delete' ou 'Reatribuição de Tarefas'
      throw new InvalidDeleteDataError()
    }

    const deletedCategory = await this.categoriesRepository.delete(id)

    return { category: deletedCategory }
  }
}
