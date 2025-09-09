import type { TagsRepository } from '@/repositories/tags-repository.ts'
import type { Tag } from 'generated/prisma/index.js'

interface ListTagsUseCaseRequest {
  name: string
  page: number
}

interface ListTagsUseCaseResponse {
  tags: Tag[]
}

export class ListTagsUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute({
    name,
    page,
  }: ListTagsUseCaseRequest): Promise<ListTagsUseCaseResponse> {
    const tags = await this.tagsRepository.findManyByName(name, page)

    return { tags }
  }
}
