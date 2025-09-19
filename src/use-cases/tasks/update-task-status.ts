import { TaskStatus, type Task } from 'generated/prisma/index.js'
import type {
  TasksRepository,
  TaskUpdateData,
} from '@/repositories/tasks-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'

interface UpdateTaskStatusUseCaseRequest {
  id: string
  status?: TaskStatus
}

interface UpdateTaskStatusUseCaseResponse {
  task: Task
}

export class UpdateTaskStatusUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    status,
  }: UpdateTaskStatusUseCaseRequest): Promise<UpdateTaskStatusUseCaseResponse> {
    if (!status) {
      throw new InvalidUpdateDataError()
    }

    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new ResourceNotFoundError()
    }

    const statusFlow: Record<TaskStatus, TaskStatus[]> = {
      TODO: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DONE', 'CANCELLED'],
      DONE: [],
      CANCELLED: [],
    }

    const allowedNextStatuses = statusFlow[task.status]
    if (!allowedNextStatuses.includes(status)) {
      throw new InvalidUpdateDataError()
    }

    const updateData: TaskUpdateData = {
      status,
    }

    if (status === 'DONE') {
      updateData.completed_at = new Date()
    }

    const updatedTask = await this.tasksRepository.update(id, updateData)

    return { task: updatedTask }
  }
}
