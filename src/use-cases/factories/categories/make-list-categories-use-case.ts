import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository.ts'
import { ListCategoriesUseCase } from '@/use-cases/categories/list-categories.ts'

export function makeListCategoriesUseCase() {
  const categoriesRepository = new PrismaCategoriesRepository()
  const useCase = new ListCategoriesUseCase(categoriesRepository)

  return useCase
}
