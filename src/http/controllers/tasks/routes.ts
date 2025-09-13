import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { create } from './create.ts'

export async function tasksRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/create-task', create)
}
