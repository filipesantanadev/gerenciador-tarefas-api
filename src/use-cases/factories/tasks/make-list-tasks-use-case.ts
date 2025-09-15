import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { ListTasksUseCase } from '@/use-cases/tasks/list-tasks.ts'

export function makeListTasksUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new ListTasksUseCase(tasksRepository)

  return useCase
}
