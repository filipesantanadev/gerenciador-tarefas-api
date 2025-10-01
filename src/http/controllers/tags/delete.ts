import { makeDeleteTagUseCase } from '@/use-cases/factories/tags/make-delete-tag-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteTagParamsSchema = z.object({
    id: z.string().uuid('Invalid Tag ID format'),
  })

  try {
    const deleteTagUseCase = makeDeleteTagUseCase()

    const { id } = deleteTagParamsSchema.parse(request.params)
    const user_id = request.user.sub

    await deleteTagUseCase.execute({
      id,
      created_by: user_id,
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
