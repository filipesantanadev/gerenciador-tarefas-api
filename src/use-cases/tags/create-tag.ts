import type { TagsRepository } from '@/repositories/tags-repository.ts'
import type { Tag } from 'generated/prisma/index.js'
import { TagNameCannotBeEmptyError } from '../errors/tag-name-cannot-be-empty-error-.ts'
import { TagNameTooLongError } from '../errors/tag-name-too-long-error.ts'
import { TagAlreadyExistsError } from '../errors/tag-already-exists-error.ts'

interface CreateTagUseCaseRequest {
  name: string
  color: string
  description?: string
  createdBy?: string
}

interface CreateTagUseCaseResponse {
  tag: Tag
}

export class CreateTagUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute({
    name,
    color,
    description,
    createdBy,
  }: CreateTagUseCaseRequest): Promise<CreateTagUseCaseResponse> {
    if (!name.trim()) {
      throw new TagNameCannotBeEmptyError()
    }

    const MAX_TAG_NAME_LENGTH = 25

    if (name.length > MAX_TAG_NAME_LENGTH) {
      throw new TagNameTooLongError(name.length, MAX_TAG_NAME_LENGTH)
    }

    const trimmedName = name.trim()

    const existingTag = await this.tagsRepository.findByName(trimmedName)

    if (existingTag) {
      throw new TagAlreadyExistsError()
    }

    const tag = await this.tagsRepository.create({
      name: trimmedName,
      color,
      description: description?.trim() ?? null,
      ...(createdBy && {
        creator: {
          connect: { id: createdBy },
        },
      }),
    })

    return { tag }
  }
}
