import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository.ts'
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { FetchTasksByCategoryUseCase } from '@/use-cases/tasks/fetch-tasks-by-category.ts'

export function makeFetchTasksByCategoryUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const categoriesRepository = new PrismaCategoriesRepository()
  const useCase = new FetchTasksByCategoryUseCase(
    tasksRepository,
    categoriesRepository,
  )

  return useCase
}
