import { makeCreateTaskUseCase } from '@/use-cases/factories/tasks/make-create-task-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { Priority, TaskStatus } from 'generated/prisma/index.js'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createTaskBodySchema = z.object({
    title: z.string().min(1).trim(),
    description: z.string().optional(),
    status: z.enum(TaskStatus),
    priority: z.enum(Priority),
    dueDate: z.coerce.date().optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
    tagIds: z
      .array(z.string().uuid('Tag IDs must be valid UUIDs'))
      .max(10, '"Maximum of 10 tags allowed')
      .optional(),
  })

  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      categoryId,
      tagIds,
    } = createTaskBodySchema.parse(request.body)

    const createTaskUseCase = makeCreateTaskUseCase()

    const user_id = request.user.sub

    await createTaskUseCase.execute({
      title,
      description: description ?? '',
      status,
      priority,
      userId: user_id,
      ...(dueDate ? { dueDate } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagIds ? { tagIds } : {}),
    })

    return reply.status(201).send()
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
