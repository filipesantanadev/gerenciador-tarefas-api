import type { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt.ts'
import { create } from './create.ts'
import { list } from './list.ts'
import { remove } from './delete.ts'
import { update } from './update.ts'
import { details } from './details.ts'
import { status } from './status.ts'
import { addTags } from './add-tags.ts'
import { removeTag } from './remove-tags.ts'
import { filter } from './filter.ts'
import { search } from './search.ts'
import { addComments } from './add-comments.ts'
import { listComments } from './list-comments.ts'

export async function tasksRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/tasks', create)
  app.get('/tasks', list)
  app.get('/tasks/:id', details)
  app.patch('/tasks/:id', update)
  app.patch('/tasks/:id/status', status)
  app.delete('/tasks/:id', remove)
  app.post('/tasks/:taskId/tags', addTags)
  app.delete('/tasks/:taskId/tags/:tagId', removeTag)
  app.get('/tasks/filter', filter)
  app.get('/tasks/search', search)
  app.post('/tasks/:taskId/comments', addComments)
  app.get('/tasks/:taskId/comments', listComments)
}
