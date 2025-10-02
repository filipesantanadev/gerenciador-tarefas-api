import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { update } from './update.ts'

export async function commentsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.patch('/comments/:id', update)
}
