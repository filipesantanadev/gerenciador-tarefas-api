import type { AdvancedFilterParams } from '@/repositories/tasks-repository.ts'
import { makeFilterTaskUseCase } from '@/use-cases/factories/tasks/make-filter-tasks-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const filterTasksQuerySchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tagIds: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional(),

  dueDateFrom: z.string().date('Invalid date format (YYYY-MM-DD)').optional(),
  dueDateTo: z.string().date('Invalid date format (YYYY-MM-DD)').optional(),
  createdAfter: z.string().date('Invalid date format (YYYY-MM-DD)').optional(),
  createdBefore: z.string().date('Invalid date format (YYYY-MM-DD)').optional(),

  includeArchived: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .default(false),
  hasDescription: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .default(true),
  overdue: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .default(false),

  orderBy: z
    .enum(['createdAt', 'dueDate', 'priority', 'title'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),

  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(Number)
    .refine((val) => val > 0, 'Page must be greater than 0')
    .optional()
    .default(1),
})

type FilterTasksQuery = z.infer<typeof filterTasksQuerySchema>

export async function filter(request: FastifyRequest, reply: FastifyReply) {
  try {
    const filterTasksUseCase = makeFilterTaskUseCase()

    const queryValidation = filterTasksQuerySchema.safeParse(request.query)

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
      title,
      status,
      categoryId,
      tagIds,
      priority,
      dueDateFrom,
      dueDateTo,
      createdAfter,
      createdBefore,
      includeArchived,
      hasDescription,
      overdue,
      orderBy,
      order,
      page,
    }: FilterTasksQuery = queryValidation.data

    const params: AdvancedFilterParams = {
      userId: request.user.sub,
      ...(title ? { title } : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(priority ? { priority } : {}),
      ...(tagIds ? { tagIds: Array.isArray(tagIds) ? tagIds : [tagIds] } : {}),
      ...(dueDateFrom ? { dueDateFrom: new Date(dueDateFrom) } : {}),
      ...(dueDateTo ? { dueDateTo: new Date(dueDateTo) } : {}),
      ...(createdAfter ? { createdAfter: new Date(createdAfter) } : {}),
      ...(createdBefore ? { createdBefore: new Date(createdBefore) } : {}),
      includeArchived,
      hasDescription,
      overdue,
      page,
      orderBy,
      order,
    }

    const { tasks, totalCount, appliedFilters } =
      await filterTasksUseCase.execute(params)

    const itemsPerPage = 20
    const totalPages = Math.ceil(totalCount / itemsPerPage)

    return reply.status(200).send({
      tasks,
      pagination: {
        page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      appliedFilters,
    })
  } catch (error) {
    console.error('Error filtering tasks:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to filter tasks',
    })
  }
}
