import type { Tag } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { TagsRepository } from '@/repositories/tags-repository.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

interface DeleteTagUseCaseRequest {
  id: string
  created_by: string
}

interface DeleteTagUseCaseResponse {
  tag: Tag | null
}

export class DeleteTagUseCase {
  constructor(
    private tagsRepository: TagsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    created_by,
  }: DeleteTagUseCaseRequest): Promise<DeleteTagUseCaseResponse> {
    const user = await this.usersRepository.findById(created_by)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const tag = await this.tagsRepository.findById(id)

    if (!tag) {
      throw new ResourceNotFoundError()
    }

    if (tag.created_by !== user.id) {
      throw new UnauthorizedError()
    }

    const deletedTag = await this.tagsRepository.delete(id)

    return { tag: deletedTag }
  }
}
