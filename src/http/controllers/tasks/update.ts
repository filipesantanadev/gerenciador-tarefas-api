import { makeUpdateTaskUseCase } from '@/use-cases/factories/tasks/make-update-task-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { Priority, TaskStatus } from 'generated/prisma/index.js'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBodySchema = z.object({
    title: z.string().min(1).trim().optional(),
    description: z.string().optional(),
    status: z.enum(TaskStatus).optional(),
    priority: z.enum(Priority).optional(),
    dueDate: z.coerce.date().optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
    tagIds: z
      .array(z.string().uuid('Tag IDs must be valid UUIDs'))
      .max(10, 'Maximum of 10 tags allowed')
      .optional(),
  })

  const updateTaskParamsSchema = z.object({
    id: z.string().uuid('Invalid task ID format'),
  })

  try {
    const { id } = updateTaskParamsSchema.parse(request.params)

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      categoryId,
      tagIds,
    } = updateBodySchema.parse(request.body)

    const updateTaskUseCase = makeUpdateTaskUseCase()

    const user_id = request.user.sub

    const task = await updateTaskUseCase.execute({
      id,
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate }),
      ...(categoryId && { categoryId }),
      ...(tagIds && { tagIds }),
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
