import type { Comment, Prisma } from 'generated/prisma/index.js'

type CommentWithUserId = Comment & {
  user: {
    id: string
    name: string
  } | null
}

export interface CommentsRepository {
  findById(id: string): Promise<Comment | null>
  findManyByTaskId(taskId: string): Promise<CommentWithUserId[]>
  update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment | null>
  delete(id: string): Promise<Comment | null>
  addCommentToTask(data: Prisma.CommentUncheckedCreateInput): Promise<Comment>
}

export type { CommentWithUserId }
