import type { Comment } from 'generated/prisma/index.js'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import type { CommentsRepository } from '@/repositories/comments-repository.ts'

interface DeleteCommentUseCaseRequest {
  id: string
  userId: string
}

interface DeleteCommentUseCaseResponse {
  comment: Comment | null
}

export class DeleteCommentUseCase {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    userId,
  }: DeleteCommentUseCaseRequest): Promise<DeleteCommentUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const comment = await this.commentsRepository.findById(id)

    if (!comment) {
      throw new ResourceNotFoundError()
    }

    if (comment.user_id !== userId && user.role !== 'ADMIN') {
      throw new UnauthorizedError()
    }

    const deletedComment = await this.commentsRepository.delete(id)

    return { comment: deletedComment }
  }
}
