import fastify from 'fastify'
import { appRoutes } from './http/routes.ts'

export const app = fastify()

app.register(appRoutes)
