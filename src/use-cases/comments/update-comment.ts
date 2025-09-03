import type { Comment } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { CommentsRepository } from '@/repositories/comments-repository.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import { InvalidContentError } from '../errors/invalid-content-error.ts'

interface UpdateCommentUseCaseRequest {
  id: string
  content: string
  userId: string
}

interface UpdateCommentUseCaseResponse {
  comment: Comment
}

export class UpdateCommentUseCase {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    content,
    userId,
  }: UpdateCommentUseCaseRequest): Promise<UpdateCommentUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (!content || !content.trim()) {
      throw new InvalidContentError()
    }

    const comment = await this.commentsRepository.findById(id)

    if (!comment) {
      throw new ResourceNotFoundError()
    }

    if (comment.user_id !== userId) {
      throw new UnauthorizedError()
    }

    const updatedComment = await this.commentsRepository.update(id, {
      content: content.trim(),
    })

    if (!updatedComment) {
      throw new ResourceNotFoundError()
    }

    return { comment: updatedComment }
  }
}
