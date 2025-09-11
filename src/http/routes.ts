import type { FastifyInstance } from 'fastify'
import { register } from './controllers/users/register.ts'
import { authenticate } from './controllers/users/authenticate.ts'
import { profile } from './controllers/users/profile.ts'
import { verifyJWT } from './middlewares/verify-jwt.ts'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /* Authenticated */
  app.get('/me', { onRequest: [verifyJWT] }, profile)
}
