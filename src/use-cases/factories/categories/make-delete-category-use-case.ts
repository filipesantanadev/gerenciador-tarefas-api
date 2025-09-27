import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository.ts'
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { DeleteCategoryUseCase } from '@/use-cases/categories/delete-category.ts'

export function makeDeleteCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const usersRepository = new PrismaUsersRepository()
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new DeleteCategoryUseCase(
    categoriesRepository,
    usersRepository,
    tasksRepository,
  )

  return useCase
}
