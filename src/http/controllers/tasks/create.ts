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
    categoryId: z
      .string()
      .uuid('ID da categoria deve ser um UUID válido')
      .optional(),
    tagIds: z
      .array(z.string().uuid('IDs das tags devem ser UUIDs válidos'))
      .max(10, 'Máximo de 10 tags permitidas')
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

    const task = await createTaskUseCase.execute({
      title,
      description: description ?? '',
      status,
      priority,
      userId: user_id,
      ...(dueDate ? { dueDate } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagIds ? { tagIds } : {}),
    })

    return reply.status(201).send({ task })
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
