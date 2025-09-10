import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { SearchTasksUseCase } from '@/use-cases/tasks/search-tasks.ts'

export function makeSearchTasksUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new SearchTasksUseCase(tasksRepository)

  return useCase
}
