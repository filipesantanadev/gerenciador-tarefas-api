import type { Prisma } from 'generated/prisma/index.js'
import type { CommentsRepository } from '../comments-repository.ts'
import { prisma } from '@/lib/prisma.ts'

export class PrismaCommentsRepository implements CommentsRepository {
  async findById(id: string) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    })
    return comment
  }

  async findManyByTaskId(taskId: string) {
    const comments = await prisma.comment.findMany({
      where: { task_id: taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return comments
  }

  async update(id: string, data: Prisma.CommentUpdateInput) {
    const comment = await prisma.comment.update({
      where: { id },
      data,
    })
    return comment
  }

  async delete(id: string) {
    const comment = await prisma.comment.delete({
      where: { id },
    })
    return comment
  }

  async addCommentToTask(data: Prisma.CommentUncheckedCreateInput) {
    const comment = await prisma.comment.create({ data })
    return comment
  }
}
