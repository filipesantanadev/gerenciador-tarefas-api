import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { register } from './register.ts'
import { authenticate } from './authenticate.ts'
import { profile } from './profile.ts'
import { update } from './update.ts'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /* Authenticated */
  app.get('/me', { onRequest: [verifyJWT] }, profile)
  app.patch('/me', { onRequest: [verifyJWT] }, update)
}
