import { makeUpdateCategoryUseCase } from '@/use-cases/factories/categories/make-update-category-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateCategoryBodySchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    color: z
      .string()
      .regex(
        /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/,
        'Color must be a valid hex color',
      )
      .transform((color) => {
        const hex = color.substring(1) // Remove #
        if (hex.length === 3) {
          // Expand RGB to RRGGBB
          return `#${hex
            .split('')
            .map((c) => c + c)
            .join('')
            .toUpperCase()}`
        }
        return color.toUpperCase() // Just standardize to uppercase
      })
      .optional(),
    icon: z.string().optional(),
    isDefault: z.boolean().optional().default(false),
  })

  const updateCategoryParamsSchema = z.object({
    id: z.string().uuid('Invalid category ID format'),
  })

  try {
    const { id } = updateCategoryParamsSchema.parse(request.params)

    const { name, description, color, icon, isDefault } =
      updateCategoryBodySchema.parse(request.body)

    const updateCategoryUseCase = makeUpdateCategoryUseCase()

    const user_id = request.user.sub

    const result = await updateCategoryUseCase.execute({
      id,
      ...(name && { name }),
      ...(description && { description }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(isDefault && { isDefault }),
      userId: user_id,
    })

    return reply.status(200).send(result)
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
