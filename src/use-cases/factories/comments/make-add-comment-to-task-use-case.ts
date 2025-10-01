import { PrismaCommentsRepository } from '@/repositories/prisma/prisma-comments-repository.ts'
import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { AddCommentToTask } from '@/use-cases/comments/add-comment-to-task.ts'

export function makeAddCommentToTaskUseCase() {
  const commentsRepository = new PrismaCommentsRepository()
  const tasksRepository = new PrismaTasksRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new AddCommentToTask(
    commentsRepository,
    tasksRepository,
    usersRepository,
  )

  return useCase
}
