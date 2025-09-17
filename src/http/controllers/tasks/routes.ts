import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { create } from './create.ts'
import { list } from './list.ts'
import { remove } from './delete.ts'
import { update } from './update.ts'

export async function tasksRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/tasks', create)
  app.get('/tasks', list)
  app.patch('/tasks/:id', update)
  app.delete('/tasks/:id', remove)
}
