import { makeSearchTasksUseCase } from '@/use-cases/factories/tasks/make-search-tasks-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const searchTasksQuerySchema = z.object({
  query: z.string().min(2).optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(Number)
    .refine((val) => val > 0, 'Page must be greater than 0')
    .optional()
    .default(1),
})

type FilterTasksQuery = z.infer<typeof searchTasksQuerySchema>

export async function search(request: FastifyRequest, reply: FastifyReply) {
  try {
    const searchTasksUseCase = makeSearchTasksUseCase()

    const queryValidation = searchTasksQuerySchema.safeParse(request.query)

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

    const { query, page }: FilterTasksQuery = queryValidation.data

    if (!query) {
      return reply.status(200).send({
        tasks: [],
        pagination: {
          page,
          total: 0,
          perPage: 20,
          totalPages: 0,
        },
      })
    }

    const { tasks, totalCount } = await searchTasksUseCase.execute({
      query,
      userId: request.user.sub,
      page,
    })

    return reply.status(200).send({
      tasks,
      pagination: {
        page,
        total: totalCount,
        perPage: 20,
        totalPages: Math.ceil(totalCount / 20),
      },
    })
  } catch (error) {
    console.error('Error filtering tasks:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to filter tasks',
    })
  }
}
