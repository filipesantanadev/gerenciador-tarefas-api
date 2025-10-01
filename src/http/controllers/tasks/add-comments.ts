import { CommentIsRequiredError } from '@/use-cases/errors/comment-is-required.ts'
import { InvalidUpdateDataError } from '@/use-cases/errors/invalid-update-data-error.ts'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error.ts'
import { makeAddCommentToTaskUseCase } from '@/use-cases/factories/comments/make-add-comment-to-task-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function addComments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const addCommentsToTaskBodySchema = z.object({
    content: z.string().min(1, 'Content is required').trim(),
  })

  const addCommentsToTaskParamsSchema = z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  })

  try {
    const { taskId } = addCommentsToTaskParamsSchema.parse(request.params)
    const { content } = addCommentsToTaskBodySchema.parse(request.body)

    const addCommentsToTaskUseCase = makeAddCommentToTaskUseCase()
    const user_id = request.user.sub

    const result = await addCommentsToTaskUseCase.execute({
      taskId,
      userId: user_id,
      content,
    })

    return reply.status(201).send({
      message: 'Comment added successfully',
      comment: result.comment,
    })
  } catch (error) {
    if (error instanceof CommentIsRequiredError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Comment content is required',
      })
    }

    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Task not found',
      })
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You are not authorized to comment on this task',
      })
    }

    if (error instanceof InvalidUpdateDataError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Cannot add comment to archived task',
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.issues,
      })
    }

    throw error
  }
}
