import { makeUpdateTaskStatusUseCase } from '@/use-cases/factories/tasks/make-update-task-status-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { TaskStatus } from 'generated/prisma/index.js'
import { z } from 'zod'

export async function status(request: FastifyRequest, reply: FastifyReply) {
  const updateTaskStatusBodySchema = z.object({
    status: z.enum(TaskStatus).optional(),
  })

  const updateTaskStatusParamsSchema = z.object({
    id: z.string().uuid('Invalid task ID format'),
  })

  try {
    const { id } = updateTaskStatusParamsSchema.parse(request.params)

    const { status } = updateTaskStatusBodySchema.parse(request.body)

    const updateTaskStatusUseCase = makeUpdateTaskStatusUseCase()

    const result = await updateTaskStatusUseCase.execute({
      id,
      ...(status && { status }),
    })

    return reply.status(200).send(result)
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
