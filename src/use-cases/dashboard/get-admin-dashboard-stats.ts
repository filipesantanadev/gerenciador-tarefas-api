import type { TasksRepository } from '@/repositories/tasks-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import type { Task } from 'generated/prisma/index.js'

interface GetAdminDashboardStatsUseCaseRequest {
  targetUserEmail?: string
}

interface GetAdminDashboardStatsUseCaseResponse {
  stats: {
    totalTasks: number
    tasksByStatus: {
      todo: number
      inProgress: number
      done: number
      cancelled: number
    }
    overdueTasks: number
    completionRate: number
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export class GetAdminDashboardStatsUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    targetUserEmail,
  }: GetAdminDashboardStatsUseCaseRequest): Promise<GetAdminDashboardStatsUseCaseResponse> {
    let allTasks: Task[]
    let targetUser = null

    if (targetUserEmail) {
      targetUser = await this.usersRepository.findByEmail(targetUserEmail)

      if (!targetUser) {
        throw new ResourceNotFoundError()
      }

      allTasks = await this.tasksRepository.findAllByUserId(targetUser.id)
    } else {
      allTasks = await this.tasksRepository.findAll()
    }

    const totalTasks = allTasks.length

    const tasksByStatus = {
      todo: allTasks.filter((task: Task) => task.status === 'TODO').length,
      inProgress: allTasks.filter((task: Task) => task.status === 'IN_PROGRESS')
        .length,
      done: allTasks.filter((task: Task) => task.status === 'DONE').length,
      cancelled: allTasks.filter((task: Task) => task.status === 'CANCELLED')
        .length,
    }

    const now = new Date()
    const overdueTasks = allTasks.filter(
      (task: Task) =>
        task.due_date &&
        new Date(task.due_date) < now &&
        task.status !== 'DONE' &&
        task.status !== 'CANCELLED',
    ).length

    const completedTasks = tasksByStatus.done
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      stats: {
        totalTasks,
        tasksByStatus,
        overdueTasks,
        completionRate,
      },
      ...(targetUser && {
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
        },
      }),
    }
  }
}
