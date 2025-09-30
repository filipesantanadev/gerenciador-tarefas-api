import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository.ts'
import { ListTagsUseCase } from '@/use-cases/tags/list-tags.ts'

export function makeListTagsUseCase() {
  const tagsRepository = new PrismaTagsRepository()
  const useCase = new ListTagsUseCase(tagsRepository)

  return useCase
}
