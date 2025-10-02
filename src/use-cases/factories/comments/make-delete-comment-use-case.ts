import { PrismaCommentsRepository } from '@/repositories/prisma/prisma-comments-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { DeleteCommentUseCase } from '@/use-cases/comments/delete-comment.ts'

export function makeDeleteCommentUseCase() {
  const commentsRepository = new PrismaCommentsRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new DeleteCommentUseCase(commentsRepository, usersRepository)

  return useCase
}
