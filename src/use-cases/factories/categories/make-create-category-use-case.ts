import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { CreateCategoryUseCase } from '@/use-cases/categories/create-category.ts'

export function makeCreateCategoryUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new CreateCategoryUseCase(
    categoriesRepository,
    usersRepository,
  )

  return useCase
}
