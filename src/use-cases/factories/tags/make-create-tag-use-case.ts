import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { CreateTagUseCase } from '@/use-cases/tags/create-tag.ts'

export function makeCreateTagUseCase() {
  const tagsRepository = new PrismaTagsRepository()
  const useCase = new CreateTagUseCase(tagsRepository)

  return useCase
}
