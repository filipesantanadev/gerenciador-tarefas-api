import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { UpdateTaskStatusUseCase } from '@/use-cases/tasks/update-task-status.ts'

export function makeUpdateTaskStatusUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new UpdateTaskStatusUseCase(tasksRepository, usersRepository)

  return useCase
}
