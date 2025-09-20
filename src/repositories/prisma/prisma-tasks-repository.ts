import { Priority, Prisma, TaskStatus } from 'generated/prisma/index.js'
import type {
  AdvancedFilterParams,
  FindManyParams,
  SearchTasksParams,
  TasksRepository,
  TaskWithRelations,
} from '../tasks-repository.ts'
import { prisma } from '@/lib/prisma.ts'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'

export class PrismaTasksRepository implements TasksRepository {
  async removeTag(taskId: string, tagId: string) {
    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        tags: {
          disconnect: {
            id: tagId,
          },
        },
      },
    })

    const updatedTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tags: true,
        category: true,
      },
    })

    return updatedTask
  }

  async addTags(taskId: string, tagIds: string[]) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { tags: true },
      })

      if (!task) {
        throw new ResourceNotFoundError()
      }

      const existingTagIds = task.tags.map((tag) => tag.id)
      const newTagIds = tagIds.filter(
        (tagId) => !existingTagIds.includes(tagId),
      )

      if (newTagIds.length === 0) {
        return task
      }

      const updatedTask = await prisma.$transaction(async (tx) => {
        // 1. Add tags to task
        await tx.task.update({
          where: { id: taskId },
          data: {
            tags: {
              connect: newTagIds.map((tagId) => ({ id: tagId })),
            },
          },
        })

        // 2. Increment usage_count
        await tx.tag.updateMany({
          where: {
            id: { in: newTagIds },
          },
          data: {
            usage_count: {
              increment: 1,
            },
          },
        })

        // 3. Reload task with updated tags
        return await tx.task.findUnique({
          where: { id: taskId },
          include: {
            tags: true,
            category: true,
          },
        })
      })

      return updatedTask
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ResourceNotFoundError()
        }
      }
      throw error
    }
  }

  async findById(id: string) {
    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    })

    return task
  }

  async findManyByCategoryId(categoryId: string, page: number) {
    const tasks = await prisma.task.findMany({
      where: {
        category_id: categoryId,
      },
      include: {
        category: true,
        tags: true,
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return tasks
  }

  async findManyByTagId(tagId: string, page: number) {
    const tasks = await prisma.task.findMany({
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      include: {
        category: true,
        tags: true,
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return tasks
  }

  async findMany(params: FindManyParams) {
    const {
      userId,
      query,
      status,
      categoryId,
      tagIds,
      priority,
      dueDate,
      page = 1,
      includeArchived = false,
      orderBy = 'createdAt',
      order = 'desc',
    } = params

    const tasks = await prisma.task.findMany({
      where: {
        user_id: userId,

        ...(!includeArchived && { is_archived: false }),

        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),

        ...(status && { status: status as TaskStatus }),
        ...(categoryId && { category_id: categoryId }),
        ...(priority && { priority: priority as Priority }),
        ...(dueDate && { due_date: dueDate }),

        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              some: {
                id: { in: tagIds },
              },
            },
          }),
      },
      include: {
        category: true,
        tags: true,
      },
      take: 20,
      skip: (page - 1) * 20,
      orderBy: {
        ...(orderBy === 'title' && { title: order }),
        ...(orderBy === 'createdAt' && { created_at: order }),
        ...(orderBy === 'dueDate' && { due_date: order }),
        ...(orderBy === 'priority' && { priority: order }),
      },
    })

    return tasks
  }

  async findManyWithAdvanceFilters(
    params: AdvancedFilterParams,
  ): Promise<TaskWithRelations[]> {
    const {
      userId,
      query,
      status,
      categoryId,
      tagIds,
      priority,
      dueDate,
      page = 1,
      includeArchived = false,
      orderBy = 'createdAt',
      order = 'desc',
      title,
      dueDateFrom,
      dueDateTo,
      createdAfter,
      createdBefore,
      hasDescription,
      overdue,
    } = params

    const now = new Date()

    const tasks = await prisma.task.findMany({
      where: {
        user_id: userId,

        ...(!includeArchived && { is_archived: false }),

        ...(query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }),

        ...(title && {
          title: { contains: title, mode: 'insensitive' },
        }),

        ...(status && { status: status as TaskStatus }),
        ...(categoryId && { category_id: categoryId }),
        ...(priority && { priority: priority as Priority }),
        ...(dueDate && { due_date: dueDate }),

        ...(dueDateFrom && {
          due_date: {
            ...((dueDateTo || dueDate) && { lte: dueDateTo || dueDate }),
            gte: dueDateFrom,
          },
        }),
        ...(dueDateTo &&
          !dueDateFrom && {
            due_date: { lte: dueDateTo },
          }),
        ...(createdAfter && {
          created_at: {
            ...(createdBefore && { lte: createdBefore }),
            gte: createdAfter,
          },
        }),
        ...(createdBefore &&
          !createdAfter && {
            created_at: { lte: createdBefore },
          }),

        ...(hasDescription !== undefined && {
          description: hasDescription ? { not: null } : null,
        }),

        ...(overdue && {
          due_date: {
            lt: now,
          },
          status: {
            not: 'COMPLETED' as TaskStatus,
          },
        }),

        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              some: {
                id: { in: tagIds },
              },
            },
          }),
      },
      include: {
        category: true,
        tags: true,
      },
      take: 20,
      skip: (page - 1) * 20,
      orderBy: {
        ...(orderBy === 'createdAt' && { created_at: order }),
        ...(orderBy === 'dueDate' && { due_date: order }),
        ...(orderBy === 'priority' && { priority: order }),
        ...(orderBy === 'title' && { title: order }),
      },
    })

    return tasks
  }

  async searchByText(params: SearchTasksParams) {
    const { userId, query, page = 1, includeArchived = false } = params

    if (!query || query.trim().length < 2) {
      return []
    }

    const tasks = (await prisma.task.findMany({
      where: {
        user_id: userId,

        ...(!includeArchived && { is_archived: false }),

        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          {
            category: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
          {
            tags: {
              some: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        category: true,
        tags: true,
      },
      take: 20,
      skip: (page - 1) * 20,
    })) as TaskWithRelations[]

    const searchTerm = query.toLowerCase().trim()

    const sortedTasks = tasks.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm)
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm)

      if (aTitleMatch && !bTitleMatch) return -1
      if (!aTitleMatch && bTitleMatch) return 1

      return b.created_at.getTime() - a.created_at.getTime()
    })

    return sortedTasks
  }

  async delete(id: string) {
    const task = await prisma.task.delete({
      where: {
        id,
      },
    })
    return task
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    const task = await prisma.task.update({
      where: {
        id,
      },
      data,
    })
    return task
  }

  async existsByCategoryId(categoryId: string) {
    const task = await prisma.task.findFirst({
      where: { category_id: categoryId },
      select: { id: true },
    })

    return task !== null
  }

  async updateWithTags(
    id: string,
    data: Prisma.TaskUpdateInput,
    tagIds: string[],
  ) {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        tags: {
          set: tagIds.map((tagId) => ({ id: tagId })),
        },
      },
    })
    return task
  }

  async create(data: Prisma.TaskUncheckedCreateInput) {
    const task = await prisma.task.create({
      data,
    })

    return task
  }
}
