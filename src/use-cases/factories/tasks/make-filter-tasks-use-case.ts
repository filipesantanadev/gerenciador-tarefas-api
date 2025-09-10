import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { FilterTasksUseCase } from '@/use-cases/tasks/filter-tasks.ts'

export function makeFilterTaskUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new FilterTasksUseCase(tasksRepository)

  return useCase
}
