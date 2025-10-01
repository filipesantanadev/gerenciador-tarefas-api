import { PrismaCommentsRepository } from '@/repositories/prisma/prisma-comments-repository.ts'
import { ListTaskCommentsUseCase } from '@/use-cases/comments/list-task-comments.ts'

export function makeListTaskCommentsUseCase() {
  const commentsRepository = new PrismaCommentsRepository()
  const useCase = new ListTaskCommentsUseCase(commentsRepository)

  return useCase
}
