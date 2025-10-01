import { makeUpdateTagUseCase } from '@/use-cases/factories/tags/make-update-tag-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateTagBodySchema = z.object({
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
  })

  const updateTagParamsSchema = z.object({
    id: z.string().uuid('Invalid tag ID format'),
  })

  try {
    const { id } = updateTagParamsSchema.parse(request.params)

    const { name, description, color } = updateTagBodySchema.parse(request.body)

    const updateTagUseCase = makeUpdateTagUseCase()

    const user_id = request.user.sub

    const result = await updateTagUseCase.execute({
      id,
      ...(name && { name }),
      ...(description && { description }),
      ...(color && { color }),
      created_by: user_id,
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
