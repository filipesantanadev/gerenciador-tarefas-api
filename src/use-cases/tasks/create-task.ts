import type { Priority, Task, TaskStatus } from 'generated/prisma/index.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { TagsRepository } from '@/repositories/tags-repository.ts'
import { TitleIsRequiredError } from '../errors/title-is-required-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

interface CreateTaskUseCaseRequest {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  completedAt?: Date
  userId: string
  categoryId?: string
  tagIds?: string[]
}

interface CreateTaskUseCaseResponse {
  task: Task
}

export class CreateTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
    private categoriesRepository: CategoriesRepository,
    private tagsRepository: TagsRepository,
  ) {}

  async execute({
    title,
    description,
    status,
    priority,
    dueDate,
    completedAt,
    userId,
    categoryId,
    tagIds = [],
  }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
    if (!title || title.trim() === '') {
      throw new TitleIsRequiredError()
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
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

    if (tagIds.length > 0) {
      const existingTags = await this.tagsRepository.findManyByIds(tagIds)

      if (existingTags.length !== tagIds.length) {
        throw new ResourceNotFoundError()
      }

      if (
        existingTags.some((tag) => tag.created_by && tag.created_by !== userId)
      ) {
        throw new UnauthorizedError()
      }
    }

    const task = await this.tasksRepository.create({
      title,
      description: description ?? null,
      status,
      priority,
      due_date: dueDate ?? null,
      completed_at: completedAt ?? null,
      user_id: userId,
      category_id: categoryId ?? null,
      ...(tagIds.length > 0 && {
        tags: { connect: tagIds.map((id) => ({ id })) },
      }),
    })

    return { task }
  }
}
