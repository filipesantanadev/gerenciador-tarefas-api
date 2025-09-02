import type { Prisma, Comment, User } from 'generated/prisma/index.js'
import type { CommentsRepository } from '../comments-repository.ts'
import { randomUUID } from 'node:crypto'

export class InMemoryCommentsRepository implements CommentsRepository {
  public items: Comment[] = []
  public users: User[] = []

  async findManyByTaskId(taskId: string) {
    const comments = this.items
      .filter((comment) => comment.task_id === taskId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((comment) => ({
        ...comment,
        user: this.users.find((user) => user.id === comment.user_id) || null,
      }))

    return comments
  }

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
