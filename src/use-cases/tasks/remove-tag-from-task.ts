import type { Task } from 'generated/prisma/index.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

interface RemoveTagFromTaskUseCaseRequest {
  taskId: string
  userId: string
  tagId: string
}

interface RemoveTagFromTaskUseCaseResponse {
  task: Task
}

export class RemoveTagFromTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    taskId,
    userId,
    tagId,
  }: RemoveTagFromTaskUseCaseRequest): Promise<RemoveTagFromTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const task = await this.tasksRepository.findById(taskId)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedError()
    }

    const updatedTask = await this.tasksRepository.removeTag(taskId, tagId)

    if (!updatedTask) {
      throw new ResourceNotFoundError()
    }

    return {
      task: updatedTask,
    }
  }
}
