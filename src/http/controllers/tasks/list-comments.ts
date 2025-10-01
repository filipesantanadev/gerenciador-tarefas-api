import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error.ts'
import { makeListTaskCommentsUseCase } from '@/use-cases/factories/comments/make-list-task-comments-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const listCommentsToTaskParamsSchema = z.object({
  taskId: z.string().uuid('Invalid task ID format'),
})

export async function listComments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { taskId } = listCommentsToTaskParamsSchema.parse(request.params)

    const listTaskCommentsUseCase = makeListTaskCommentsUseCase()

    const { comments } = await listTaskCommentsUseCase.execute({
      taskId,
    })

    return reply.status(200).send({
      comments,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Task not found',
      })
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You are not authorized to view these comments',
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request parameters',
        details: error.issues,
      })
    }

    console.error('Error listing task comments:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to list comments',
    })
  }
}
