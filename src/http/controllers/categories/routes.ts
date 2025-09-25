import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { fetchTasksByCategory } from './fetch-by-category.ts'

export async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/categories/:id/tasks', fetchTasksByCategory)
}
