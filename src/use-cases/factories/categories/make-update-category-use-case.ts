import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { UpdateCategoryUseCase } from '@/use-cases/categories/update-category.ts'

export function makeUpdateCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new UpdateCategoryUseCase(
    categoriesRepository,
    usersRepository,
  )

  return useCase
}
