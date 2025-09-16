import { makeDeleteTaskUseCase } from '@/use-cases/factories/tasks/make-delete-task-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteTaskParamsSchema = z.object({
    id: z.string().uuid('Invalid task ID format'),
  })

  try {
    const deleteTaskUseCase = makeDeleteTaskUseCase()

    const { id } = deleteTaskParamsSchema.parse(request.params)
    const user_id = request.user.sub

    await deleteTaskUseCase.execute({
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
