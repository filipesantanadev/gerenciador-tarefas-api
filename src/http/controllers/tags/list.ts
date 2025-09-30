import type { FindManyOptions } from '@/repositories/tags-repository.ts'
import { makeListTagsUseCase } from '@/use-cases/factories/tags/make-list-tags-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import z from 'zod'

const listTagsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(Number)
    .refine((val) => val > 0, 'Page must be greater than 0')
    .optional()
    .default(1),
  sortBy: z.enum(['name', 'created_at']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
})

type ListTagsQuery = z.infer<typeof listTagsQuerySchema>

export async function list(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listTagsUseCase = makeListTagsUseCase()

    const queryValidation = listTagsQuerySchema.safeParse(request.query)

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

    const { search, page, sortBy, order }: ListTagsQuery = queryValidation.data

    const params: FindManyOptions = {
      userId: request.user.sub,
      ...(search ? { search } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(order ? { order } : {}),
      page,
    }

    const { tags } = await listTagsUseCase.execute(params)

    return reply.status(200).send({
      tags,
      pagination: {
        page,
        total: tags.length,
      },
    })
  } catch (error) {
    console.error('Error listing tags:', error)

    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to list tags',
    })
  }
}
