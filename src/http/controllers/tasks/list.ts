import type { FindManyParams } from '@/repositories/tasks-repository.ts'
import { makeListTasksUseCase } from '@/use-cases/factories/tasks/make-list-tasks-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const listTasksQuerySchema = z.object({
  query: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  tagIds: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime('Invalid date format').optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(Number)
    .refine((val) => val > 0, 'Page must be greater than 0')
    .optional()
    .default(1),
  includeArchived: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .default(false),
  orderBy: z
    .enum(['createdAt', 'dueDate', 'priority', 'title'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

type ListTasksQuery = z.infer<typeof listTasksQuerySchema>

export async function list(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listTasksUseCase = makeListTasksUseCase()

    const queryValidation = listTasksQuerySchema.safeParse(request.query)

    if (!queryValidation.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        message: 'Invalid query parameters',
        details: queryValidation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    const {
      query,
      title,
      status,
      categoryId,
      tagIds,
      priority,
      dueDate,
      page,
      includeArchived,
      orderBy,
      order,
    }: ListTasksQuery = queryValidation.data

    const params: FindManyParams = {
      userId: request.user.sub,
      ...(query ? { query } : {}),
      ...(title ? { title } : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagIds ? { tagIds: Array.isArray(tagIds) ? tagIds : [tagIds] } : {}),
      ...(priority ? { priority } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      page,
      includeArchived,
      orderBy,
      order,
    }

    const { tasks } = await listTasksUseCase.execute(params)

    return reply.status(200).send({
      tasks,
      pagination: {
        page,
        total: tasks.length,
      },
    })
  } catch (error) {
    console.error('Error listing tasks:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to list tasks',
    })
  }
}
