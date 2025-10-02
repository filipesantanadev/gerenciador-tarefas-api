import { PrismaCommentsRepository } from '@/repositories/prisma/prisma-comments-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { UpdateCommentUseCase } from '@/use-cases/comments/update-comment.ts'

export function makeUpdateCommentUseCase() {
  const commentsRepository = new PrismaCommentsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new UpdateCommentUseCase(commentsRepository, usersRepository)

  return useCase
}
