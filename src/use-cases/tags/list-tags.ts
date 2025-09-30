import type {
  FindManyOptions,
  TagsRepository,
} from '@/repositories/tags-repository.ts'
import type { Tag } from 'generated/prisma/index.js'

interface ListTagsUseCaseResponse {
  tags: Tag[]
}

export class ListTagsUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute(params: FindManyOptions): Promise<ListTagsUseCaseResponse> {
    const tags = await this.tagsRepository.findMany(params)

    return { tags }
  }
}
