import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { DeleteTaskUseCase } from '@/use-cases/tasks/delete-task.ts'

export function makeDeleteTaskUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new DeleteTaskUseCase(usersRepository, tasksRepository)

  return useCase
}
