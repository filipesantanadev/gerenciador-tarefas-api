import type { TagsRepository } from '@/repositories/tags-repository.ts'
import type { Tag } from 'generated/prisma/index.js'

interface CreateTagUseCaseRequest {
  name: string
  color: string
}

interface CreateTagUseCaseResponse {
  tag: Tag
}

export class CreateTagUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute({
    name,
    color,
  }: CreateTagUseCaseRequest): Promise<CreateTagUseCaseResponse> {
    const tag = await this.tagsRepository.create({
      name,
      color,
    })

    return { tag }
  }
}
