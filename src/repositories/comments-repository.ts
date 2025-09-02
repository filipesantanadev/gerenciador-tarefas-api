import type { Comment, Prisma } from 'generated/prisma/index.js'

export interface CommentsRepository {
  addCommentToTask(data: Prisma.CommentUncheckedCreateInput): Promise<Comment>
}
