import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { update } from './update.ts'
import { remove } from './delete.ts'

export async function commentsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.patch('/comments/:id', update)
  app.delete('/comments/:id', remove)
}
