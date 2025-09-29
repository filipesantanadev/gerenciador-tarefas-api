import { TagAlreadyExistsError } from '@/use-cases/errors/tag-already-exists-error.ts'
import { TagNameCannotBeEmptyError } from '@/use-cases/errors/tag-name-cannot-be-empty-error-.ts'
import { TagNameTooLongError } from '@/use-cases/errors/tag-name-too-long-error.ts'
import { makeCreateTagUseCase } from '@/use-cases/factories/tags/make-create-tag-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createTagBodySchema = z.object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(25, 'Name must be at most 25 characters')
      .trim(),
    description: z.string().optional(),
    color: z
      .string()
      .regex(
        /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/,
        'Color must be a valid hex color',
      )
      .transform((color) => {
        const hex = color.substring(1)
        if (hex.length === 3) {
          return `#${hex
            .split('')
            .map((c) => c + c)
            .join('')
            .toUpperCase()}`
        }
        return color.toUpperCase()
      }),
  })

  try {
    const { name, color, description } = createTagBodySchema.parse(request.body)

    const createTagUseCase = makeCreateTagUseCase()

    const created_by = request.user.sub

    const result = await createTagUseCase.execute({
      name,
      color,
      ...(description && { description }),
      createdBy: created_by,
    })

    return reply.status(201).send({
      tag: result.tag,
    })
  } catch (error) {
    if (error instanceof TagAlreadyExistsError) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Tag already exists',
      })
    }

    if (error instanceof TagNameCannotBeEmptyError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Tag name cannot be empty',
      })
    }

    if (error instanceof TagNameTooLongError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error,
      })
    }

    throw error
  }
}
