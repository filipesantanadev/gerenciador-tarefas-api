import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { create } from './create.ts'
import { list } from './list.ts'

export async function tagsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/tags', create)
  app.get('/tags', list)
}
