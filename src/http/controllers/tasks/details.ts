import { makeGetTaskDetailsUseCase } from '@/use-cases/factories/tasks/make-get-task-details-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function details(request: FastifyRequest, reply: FastifyReply) {
  const detailsTaskParamsSchema = z.object({
    id: z.string().uuid('Invalid task ID format'),
  })

  try {
    const detailsTaskUseCase = makeGetTaskDetailsUseCase()

    const { id } = detailsTaskParamsSchema.parse(request.params)
    const user_id = request.user.sub

    const task = await detailsTaskUseCase.execute({
      id,
      userId: user_id,
    })

    return reply.status(200).send(task)
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
