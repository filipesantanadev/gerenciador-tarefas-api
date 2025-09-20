import { makeAddTagsToTaskUseCase } from '@/use-cases/factories/tasks/make-add-tags-to-task-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function addTags(request: FastifyRequest, reply: FastifyReply) {
  const addTagsToTaskBodySchema = z.object({
    tags: z
      .array(
        z
          .object({
            id: z.string().uuid().optional(),
            name: z.string().optional(),
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
          .refine((data) => data.id || data.name, {
            message:
              'Either id (for existing tag) or name (for new tag) must be provided',
          }),
      )
      .optional()
      .default([]),
  })

  const addTagsToTaskParamsSchema = z.object({
    taskId: z.string().uuid('Invalid task ID format'),
  })

  try {
    const { taskId } = addTagsToTaskParamsSchema.parse(request.params)
    const { tags } = addTagsToTaskBodySchema.parse(request.body)

    const addTagsToTaskUseCase = makeAddTagsToTaskUseCase()
    const user_id = request.user.sub

    const result = await addTagsToTaskUseCase.execute({
      taskId,
      userId: user_id,
      tags: tags as Array<{
        id?: string
        name?: string
        description?: string
        color?: string
      }>,
    })

    return reply.status(200).send({
      message: 'Tags added successfully',
      task: result.task,
    })
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
