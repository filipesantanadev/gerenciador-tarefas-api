import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { GetTaskDetailsUseCase } from '@/use-cases/tasks/get-task-details.ts'

export function makeGetTaskDetailsUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new GetTaskDetailsUseCase(tasksRepository)

  return useCase
}
