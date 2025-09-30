import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { UpdateTagUseCase } from '@/use-cases/tags/update-tag.ts'

export function makeUpdateTagUseCase() {
  const tagsRepository = new PrismaTagsRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateTagUseCase(tagsRepository, usersRepository)

  return useCase
}
