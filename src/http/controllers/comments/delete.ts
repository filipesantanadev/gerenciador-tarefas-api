import { makeDeleteCommentUseCase } from '@/use-cases/factories/comments/make-delete-comment-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteCommentParamsSchema = z.object({
    id: z.string().uuid('Invalid Comment ID format'),
  })

  try {
    const deleteCommentUseCase = makeDeleteCommentUseCase()

    const { id } = deleteCommentParamsSchema.parse(request.params)
    const user_id = request.user.sub

    await deleteCommentUseCase.execute({
      id,
      userId: user_id,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.issues,
      })
    }

    throw error
  }
}
