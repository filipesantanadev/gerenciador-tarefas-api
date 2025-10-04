import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error.ts'
import { makeGetAdminDashboardStatsUseCase } from '@/use-cases/factories/dashboard/make-get-admin-dashboard-stats-use-case.ts'
import { makeGetDashboardStatsUseCase } from '@/use-cases/factories/dashboard/make-get-dashboard-stats-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const getAdminDashboardStatsQuerySchema = z.object({
  userEmail: z.string().email().optional(),
})

export async function getDashboardStats(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub
    const userRole = request.user.role

    const { userEmail } = getAdminDashboardStatsQuerySchema.parse(request.query)

    let result

    if (userRole === 'ADMIN') {
      const getAdminDashboardStatsUseCase = makeGetAdminDashboardStatsUseCase()
      result = await getAdminDashboardStatsUseCase.execute({
        ...(userEmail && { targetUserEmail: userEmail }),
      })
    } else {
      const getDashboardStatsUseCase = makeGetDashboardStatsUseCase()
      result = await getDashboardStatsUseCase.execute({ userId })
    }

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found',
      })
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'You do not have permission to access this resource',
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error,
      })
    }

    console.error('Error fetching dashboard stats:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch dashboard statistics',
    })
  }
}
