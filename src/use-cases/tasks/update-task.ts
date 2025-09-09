import { Priority, TaskStatus, type Task } from 'generated/prisma/index.js'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'
import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { TagsRepository } from '@/repositories/tags-repository.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'

interface UpdateTaskUseCaseRequest {
  id: string
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  dueDate?: Date | null
  completedAt?: Date | null
  isArchived?: boolean
  userId: string
  categoryId?: string | null
  tags?: { id: string }[]
  page: number
}

interface UpdateTaskUseCaseResponse {
  task: Task
}

export class UpdateTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
    private categoriesRepository: CategoriesRepository,
    private tagsRepository: TagsRepository,
  ) {}

  async execute({
    id,
    title,
    description,
    status,
    priority,
    dueDate,
    completedAt,
    isArchived,
    userId,
    categoryId,
    tags = [],
    page,
  }: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
    const requestFields = {
      title,
      description,
      status,
      priority,
      dueDate,
      completedAt,
      isArchived,
      categoryId,
      tags,
    }

    const hasValidUpdates = Object.entries(requestFields).some(
      ([key, value]) => {
        if (key === 'tags') {
          return Array.isArray(value) && value.length > 0
        }
        return value !== undefined
      },
    )

    if (!hasValidUpdates) {
      throw new InvalidUpdateDataError()
    }

    const tagIds = tags?.map((t) => t.id) || []

    const [user, task, category, existingTags] = await Promise.all([
      this.usersRepository.findById(userId),
      this.tasksRepository.findById(id),
      categoryId
        ? this.categoriesRepository.findById(categoryId)
        : Promise.resolve(null),
      tagIds.length > 0
        ? this.tagsRepository.findManyByIds(tagIds, page)
        : Promise.resolve([]),
    ])

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedError()
    }

    if (task.is_archived) {
      const forbiddenUpdates = [status, title, description, priority, dueDate]
      const hasForbiddenUpdates = forbiddenUpdates.some(
        (val) => val !== undefined,
      )
      const hasTagUpdates = tags && tags.length > 0

      if (hasForbiddenUpdates || hasTagUpdates) {
        throw new InvalidUpdateDataError()
      }
    }

    const statusFlow: Record<TaskStatus, TaskStatus[]> = {
      TODO: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DONE', 'CANCELLED'],
      DONE: [],
      CANCELLED: [],
    }

    if (categoryId !== undefined) {
      if (categoryId) {
        if (!category) {
          throw new ResourceNotFoundError()
        }
        if (category.user_id !== userId) {
          throw new UnauthorizedError()
        }
      }
    }

    if (tagIds.length > 0) {
      if (existingTags.length !== tagIds.length) {
        throw new ResourceNotFoundError()
      }

      const unauthorizedTag = existingTags.find(
        (tag) => tag.created_by && tag.created_by !== userId,
      )

      if (unauthorizedTag) {
        throw new UnauthorizedError()
      }
    }

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) {
      if (typeof title === 'string' && title.trim()) {
        updateData.title = title.trim()
      } else {
        throw new InvalidUpdateDataError()
      }
    }
    if (description !== undefined) updateData.description = description

    if (status) {
      const allowedNextStatuses = statusFlow[task.status]
      if (!allowedNextStatuses.includes(status)) {
        throw new InvalidUpdateDataError()
      }

      updateData.status = status

      if (status === 'DONE') {
        updateData.completed_at = completedAt ?? new Date()
      }
    }

    if (completedAt !== undefined && !status) {
      if (task.status === 'DONE') {
        updateData.completed_at = completedAt
      } else {
        throw new InvalidUpdateDataError()
      }
    }

    if (priority) updateData.priority = priority

    if (dueDate !== undefined) updateData.due_date = dueDate

    if (typeof isArchived === 'boolean') updateData.is_archived = isArchived

    if (categoryId !== undefined) updateData.category_id = categoryId

    let updatedTask: Task

    if (tags !== undefined) {
      updatedTask = await this.tasksRepository.updateWithTags(
        id,
        updateData,
        tagIds,
      )
    } else {
      updatedTask = await this.tasksRepository.update(id, updateData)
    }

    return { task: updatedTask }
  }
}
