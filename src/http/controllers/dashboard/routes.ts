import type { FastifyInstance } from 'fastify'
import { getDashboardStats } from './dashboard-stats.ts'
// import { verifyUserRole } from '@/http/middlewares/verify-user-role.ts'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/dashboard/stats', getDashboardStats)
}
