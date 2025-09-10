import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { RemoveTagFromTaskUseCase } from '@/use-cases/tasks/remove-tag-from-task.ts'

export function makeRemoveTagFromTaskUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new RemoveTagFromTaskUseCase(tasksRepository, usersRepository)

  return useCase
}
