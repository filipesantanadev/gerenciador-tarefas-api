import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { DeleteTagUseCase } from '@/use-cases/tags/delete-tag.ts'

export function makeDeleteTagUseCase() {
  const tagsRepository = new PrismaTagsRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new DeleteTagUseCase(tagsRepository, usersRepository)

  return useCase
}
