import { CategoryAlreadyExistsError } from '@/use-cases/errors/category-already-exists-error.ts'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error.ts'
import { makeCreateCategoryUseCase } from '@/use-cases/factories/categories/make-create-category-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCategoryBodySchema = z.object({
    name: z.string().min(2),
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

  try {
    const { name, description, color, icon, isDefault } =
      createCategoryBodySchema.parse(request.body)

    const createCategoryUseCase = makeCreateCategoryUseCase()

    const user_id = request.user.sub

    const result = await createCategoryUseCase.execute({
      name,
      ...(description && { description }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(isDefault !== undefined && { isDefault }),
      userId: user_id,
    })

    return reply.status(201).send({
      category: result.category,
    })
  } catch (error) {
    if (error instanceof CategoryAlreadyExistsError) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Category already exists',
      })
    }

    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.issues,
      })
    }

    throw error
  }
}
