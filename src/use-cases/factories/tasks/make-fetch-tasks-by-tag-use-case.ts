import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { FetchTasksByTagUseCase } from '@/use-cases/tasks/fetch-tasks-by-tag.ts'

export function makeFetchTasksByTagUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const tagsRepository = new PrismaTagsRepository()
  const useCase = new FetchTasksByTagUseCase(tasksRepository, tagsRepository)

  return useCase
}
