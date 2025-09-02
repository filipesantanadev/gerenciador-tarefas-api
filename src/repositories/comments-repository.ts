import type { Comment, Prisma, User } from 'generated/prisma/index.js'

type CommentWithUser = Comment & {
  user: User | null
}

export interface CommentsRepository {
  findManyByTaskId(taskId: string): Promise<CommentWithUser[]>
  addCommentToTask(data: Prisma.CommentUncheckedCreateInput): Promise<Comment>
}

export type { CommentWithUser }
