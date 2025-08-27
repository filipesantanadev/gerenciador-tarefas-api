import { Priority, TaskStatus, type Task } from 'generated/prisma/index.js'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'

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
}

interface UpdateTaskUseCaseResponse {
  task: Task
}

export class UpdateTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
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
  }: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.user_id !== userId) {
      throw new ResourceNotFoundError()
    }

    if (status && !Object.values(TaskStatus).includes(status)) {
      throw new InvalidUpdateDataError()
    }

    if (priority && !Object.values(Priority).includes(priority)) {
      throw new InvalidUpdateDataError()
    }

    const updateData: Record<string, unknown> = {}

    if (title) updateData.title = title
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
    console.log('Use case returning task with due_date:', updatedTask.due_date)

    return { task: updatedTask }
  }
}
