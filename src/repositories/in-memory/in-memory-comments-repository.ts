import type { Prisma, Comment, User } from 'generated/prisma/index.js'
import type { CommentsRepository } from '../comments-repository.ts'
import { randomUUID } from 'node:crypto'

export class InMemoryCommentsRepository implements CommentsRepository {
  public items: Comment[] = []
  public users: User[] = []

  async findById(id: string) {
    const comment = this.items.find((comment) => comment.id === id) || null
    return comment
  }

  async update(id: string, data: Prisma.CommentUpdateInput) {
    const commentIndex = this.items.findIndex((comment) => comment.id === id)

    if (commentIndex === -1) {
      return null
    }

    const existingComment = this.items[commentIndex]

    if (!existingComment) {
      return null
    }

    const updatedComment: Comment = {
      id: existingComment.id,
      content: (data.content as string) ?? existingComment.content,
      task_id: existingComment.task_id,
      user_id: existingComment.user_id,
      created_at: existingComment.created_at,
      updated_at: new Date(),
    }

    this.items[commentIndex] = updatedComment

    return updatedComment
  }

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

  async delete(id: string) {
    const commentToRemove = this.items.find((comment) => comment.id === id)

    if (!commentToRemove) {
      return null
    }

    this.items = this.items.filter((comment) => comment.id !== id)

    return commentToRemove
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
