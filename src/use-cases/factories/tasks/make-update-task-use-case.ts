import { PrismaCategoriesRepository } from '@/repositories/prisma/prisma-categories-repository.ts'
import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { UpdateTaskUseCase } from '@/use-cases/tasks/update-task.ts'

export function makeUpdateTaskUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const usersRepository = new PrismaUsersRepository()
  const categoriesRepository = new PrismaCategoriesRepository()
  const tagsRepository = new PrismaTagsRepository()
  const useCase = new UpdateTaskUseCase(
    tasksRepository,
    usersRepository,
    categoriesRepository,
    tagsRepository,
  )

  return useCase
}
