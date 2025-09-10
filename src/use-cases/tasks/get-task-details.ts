import type { Task } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'

interface GetTaskDetailsUseCaseRequest {
  id: string
  userId: string
}

interface GetTaskDetailsUseCaseResponse {
  task: Task
}

export class GetTaskDetailsUseCase {
  constructor(private taskRepository: TasksRepository) {}

  async execute({
    id,
    userId,
  }: GetTaskDetailsUseCaseRequest): Promise<GetTaskDetailsUseCaseResponse> {
    const task = await this.taskRepository.findById(id)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    if (userId !== task.user_id) {
      throw new UnauthorizedError()
    }

    return { task }
  }
}
