import type { Task } from 'generated/prisma/index.js'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'

interface DeleteTaskUseCaseRequest {
  id: string
  userId: string
}

interface DeleteTaskUseCaseResponse {
  task: Task | null
}

export class DeleteTaskUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tasksRepository: TasksRepository,
  ) {}

  async execute({
    id,
    userId,
  }: DeleteTaskUseCaseRequest): Promise<DeleteTaskUseCaseResponse> {
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

    const deletedTask = await this.tasksRepository.delete(id)

    return { task: deletedTask }
  }
}
