import type { Tag } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { TagsRepository } from '@/repositories/tags-repository.ts'
import { TagAlreadyExistsError } from '../errors/tag-already-exists-error.ts'

interface UpdateTagUseCaseRequest {
  id: string
  name?: string
  description?: string
  color?: string
  created_by: string
}

interface UpdateTagUseCaseResponse {
  tag: Tag
}

export class UpdateTagUseCase {
  constructor(
    private tagsRepository: TagsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    name,
    description,
    color,
    created_by,
  }: UpdateTagUseCaseRequest): Promise<UpdateTagUseCaseResponse> {
    const user = await this.usersRepository.findById(created_by)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const tag = await this.tagsRepository.findById(id)

    if (!tag) {
      throw new ResourceNotFoundError()
    }

    if (name) {
      const tagsWithSameName = await this.tagsRepository.findByName(name)

      const duplicateTag = tagsWithSameName.find(
        (tag) => tag.name === name && tag.id !== id,
      )

      if (duplicateTag) {
        throw new TagAlreadyExistsError()
      }
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (color) updateData.color = color
    if (description) updateData.description = description

    if (Object.keys(updateData).length === 0) {
      throw new InvalidUpdateDataError()
    }

    const updatedTag = await this.tagsRepository.update(id, updateData)

    return { tag: updatedTag }
  }
}
