import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'
import { makeFetchTasksByCategoryUseCase } from '@/use-cases/factories/tasks/make-fetch-tasks-by-category-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const fetchTasksByCategoryParamsSchema = z.object({
  id: z.string().uuid('Invalid category ID format'),
})

const fetchTasksByCategoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
})

export async function fetchTasksByCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = fetchTasksByCategoryParamsSchema.parse(request.params)

    const { page } = fetchTasksByCategoryQuerySchema.parse(request.query)

    const fetchTasksByCategoryUseCase = makeFetchTasksByCategoryUseCase()

    const result = await fetchTasksByCategoryUseCase.execute({
      categoryId: id,
      page,
    })

    return reply.status(200).send({
      tasks: result.tasks,
      pagination: {
        page,
        total: result.tasks.length,
      },
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Tasks By Category not found',
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request parameters',
        details: error.issues,
      })
    }

    console.error('Error fetching tasks by category:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to fetch tasks by category',
    })
  }
}
