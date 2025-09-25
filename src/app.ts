import fastify from 'fastify'
import { usersRoutes } from './http/controllers/users/routes.ts'
import { ZodError } from 'zod'
import { env } from './env/index.ts'
import fastifyJwt from '@fastify/jwt'
import { tasksRoutes } from './http/controllers/tasks/routes.ts'
import { categoriesRoutes } from './http/controllers/categories/routes.ts'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(usersRoutes)
app.register(tasksRoutes)
app.register(categoriesRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Log to an external tool (Sentry, DataDog)
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
