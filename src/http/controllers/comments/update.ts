import { InvalidContentError } from '@/use-cases/errors/invalid-content-error.ts'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized-error.ts'
import { makeUpdateCommentUseCase } from '@/use-cases/factories/comments/make-update-comment-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateCommentBodySchema = z.object({
    content: z.string().min(1, 'Content is required').trim(),
  })

  const updateCommentParamsSchema = z.object({
    id: z.string().uuid('Invalid Comment ID format'),
  })

  try {
    const { id } = updateCommentParamsSchema.parse(request.params)
    const { content } = updateCommentBodySchema.parse(request.body)

    const updateCommentUseCase = makeUpdateCommentUseCase()
    const user_id = request.user.sub

    const result = await updateCommentUseCase.execute({
      id,
      userId: user_id,
      content,
    })

    return reply.status(200).send({
      message: 'Comment updated successfully',
      comment: result.comment,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Comment not found',
      })
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You can only edit your own comments',
      })
    }

    if (error instanceof InvalidContentError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Comment content cannot be empty',
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error,
      })
    }

    throw error
  }
}
