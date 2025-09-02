import type { Prisma, Comment } from 'generated/prisma/index.js'
import type { CommentsRepository } from '../comments-repository.ts'
import { randomUUID } from 'node:crypto'

export class InMemoryCommentsRepository implements CommentsRepository {
  public items: Comment[] = []

  async addCommentToTask(data: Prisma.CommentUncheckedCreateInput) {
    const newComment: Comment = {
      id: data.id ?? randomUUID(),
      content: data.content,
      task_id: data.task_id,
      user_id: data.user_id,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(newComment)

    return newComment
  }
}
