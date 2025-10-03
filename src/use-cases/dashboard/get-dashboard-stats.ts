import type { TasksRepository } from '@/repositories/tasks-repository.ts'

interface GetDashboardStatsUseCaseRequest {
  userId: string
}

interface GetDashboardStatsUseCaseResponse {
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

export class GetDashboardStatsUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    userId,
  }: GetDashboardStatsUseCaseRequest): Promise<GetDashboardStatsUseCaseResponse> {
    // Buscar todas as tasks do usuário (sem paginação para stats)
    const allTasks = await this.tasksRepository.findAllByUserId(userId)

    const totalTasks = allTasks.length

    // Contar por status
    const tasksByStatus = {
      todo: allTasks.filter((task) => task.status === 'TODO').length,
      inProgress: allTasks.filter((task) => task.status === 'IN_PROGRESS')
        .length,
      done: allTasks.filter((task) => task.status === 'DONE').length,
      cancelled: allTasks.filter((task) => task.status === 'CANCELLED').length,
    }

    // Tasks atrasadas (vencidas e não concluídas)
    const now = new Date()
    const overdueTasks = allTasks.filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date) < now &&
        task.status !== 'DONE' &&
        task.status !== 'CANCELLED',
    ).length

    // Taxa de conclusão
    const completedTasks = tasksByStatus.done
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      tasksByStatus,
      overdueTasks,
      completionRate,
    }
  }
}
