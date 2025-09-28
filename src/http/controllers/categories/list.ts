import { makeListCategoriesUseCase } from '@/use-cases/factories/categories/make-list-categories-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const listCategoriesQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(Number)
    .refine((val) => val > 0, 'Page must be greater than 0')
    .optional()
    .default(1),
})

type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>

export async function list(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listCategoriesUseCase = makeListCategoriesUseCase()

    const queryValidation = listCategoriesQuerySchema.safeParse(request.query)

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

    const { page }: ListCategoriesQuery = queryValidation.data

    const params = {
      userId: request.user.sub,
      page,
    }

    const { categories } = await listCategoriesUseCase.execute(params)

    return reply.status(200).send({
      categories,
      pagination: {
        page,
        total: categories.length,
      },
    })
  } catch (error) {
    console.error('Error listing categories:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to list categories',
    })
  }
}
