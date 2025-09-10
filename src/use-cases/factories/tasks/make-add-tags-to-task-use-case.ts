import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { AddTagsToTaskUseCase } from '@/use-cases/tasks/add-tags-to-task.ts'

export function makeAddTagsToTaskUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const usersRepository = new PrismaUsersRepository()
  const tagsRepository = new PrismaTagsRepository()
  const useCase = new AddTagsToTaskUseCase(
    tasksRepository,
    usersRepository,
    tagsRepository,
  )

  return useCase
}
