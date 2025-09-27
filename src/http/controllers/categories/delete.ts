import { makeDeleteCategoryUseCase } from '@/use-cases/factories/categories/make-delete-category-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteCategoryParamsSchema = z.object({
    id: z.string().uuid('Invalid category ID format'),
  })

  try {
    const deleteCategoryUseCase = makeDeleteCategoryUseCase()

    const { id } = deleteCategoryParamsSchema.parse(request.params)
    const user_id = request.user.sub

    await deleteCategoryUseCase.execute({
      id,
      userId: user_id,
    })

    return reply.status(204).send()
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
