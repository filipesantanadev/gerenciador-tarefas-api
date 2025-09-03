import type { Comment, Prisma, User } from 'generated/prisma/index.js'

type CommentWithUser = Comment & {
  user: User | null
}

export interface CommentsRepository {
  findById(id: string): Promise<Comment | null>
  findManyByTaskId(taskId: string): Promise<CommentWithUser[]>
  update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment | null>
  delete(id: string): Promise<Comment | null>
  addCommentToTask(data: Prisma.CommentUncheckedCreateInput): Promise<Comment>
}

export type { CommentWithUser }
