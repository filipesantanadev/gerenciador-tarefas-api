import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository.ts'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { GetAdminDashboardStatsUseCase } from '@/use-cases/dashboard/get-admin-dashboard-stats.ts'

export function makeGetAdminDashboardStatsUseCase() {
  const tasksRepository = new PrismaTasksRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new GetAdminDashboardStatsUseCase(
    tasksRepository,
    usersRepository,
  )

  return useCase
}
