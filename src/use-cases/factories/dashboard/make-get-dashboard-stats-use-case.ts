import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { GetDashboardStatsUseCase } from '@/use-cases/dashboard/get-dashboard-stats.ts'

export function makeGetDashboardStatsUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const useCase = new GetDashboardStatsUseCase(tasksRepository)

  return useCase
}
