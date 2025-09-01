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
  categoryId: string | null
  tags: { id: string }[]
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
    tags,
  }: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedError()
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findById(categoryId)
      if (!category) {
        throw new ResourceNotFoundError()
      }
      if (category.user_id !== userId) {
        throw new UnauthorizedError()
      }
    }

    const tagIds = tags.map((t) => t.id)
    const existingTags = await this.tagsRepository.findManyByIds(tagIds)
    if (existingTags.length !== tagIds.length) {
      throw new ResourceNotFoundError()
    }
    if (
      existingTags.some((tag) => tag.created_by && tag.created_by !== userId)
    ) {
      throw new UnauthorizedError()
    }

    if (status && !Object.values(TaskStatus).includes(status)) {
      throw new InvalidUpdateDataError()
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      throw new InvalidUpdateDataError()
    }

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) {
      if (title.trim()) {
        updateData.title = title.trim()
      } else {
        throw new InvalidUpdateDataError()
      }
    }
    if (description !== undefined) updateData.description = description
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (dueDate !== undefined) updateData.due_date = dueDate

    if (completedAt !== undefined) updateData.completed_at = completedAt
    if (typeof isArchived === 'boolean') updateData.is_archived = isArchived

    if (Object.keys(updateData).length === 0) {
      throw new InvalidUpdateDataError()
    }

    const updatedTask = await this.tasksRepository.update(id, updateData)

    return { task: updatedTask }
  }
}
