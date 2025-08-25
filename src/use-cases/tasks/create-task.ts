import type { Priority, Tag, Task, TaskStatus } from 'generated/prisma/index.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { TasksRepository } from '@/repositories/tasks-repository.ts'

interface CreateTaskUseCaseRequest {
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  completedAt?: Date
  userId: string
  categoryId?: string
  tags: Tag[]
}

interface CreateTaskUseCaseResponse {
  task: Task
}

export class CreateTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
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
  }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new InvalidCredentialsError()
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
    })

    return { task }
  }
}
