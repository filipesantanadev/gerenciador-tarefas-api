import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { fetchTasksByCategory } from './fetch-by-category.ts'
import { create } from './create.ts'
import { remove } from './delete.ts'

export async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/categories', create)
  app.delete('/categories/:id', remove)
  app.get('/categories/:id/tasks', fetchTasksByCategory)
}
