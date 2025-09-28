import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { fetchTasksByCategory } from './fetch-by-category.ts'
import { create } from './create.ts'
import { remove } from './delete.ts'
import { update } from './update.ts'

export async function categoriesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/categories', create)
  app.patch('/categories/:id', update)
  app.delete('/categories/:id', remove)
  app.get('/categories/:id/tasks', fetchTasksByCategory)
}
