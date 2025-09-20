import { makeRemoveTagFromTaskUseCase } from '@/use-cases/factories/tasks/make-remove-tag-from-task-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function removeTag(request: FastifyRequest, reply: FastifyReply) {
  const removeTagsFromTaskParamsSchema = z.object({
    taskId: z.string().uuid('Invalid task ID format'),
    tagId: z.string().uuid('Invalid tag ID format'),
  })

  try {
    const removeTagsFromTaskUseCase = makeRemoveTagFromTaskUseCase()

    const { taskId, tagId } = removeTagsFromTaskParamsSchema.parse(
      request.params,
    )
    const user_id = request.user.sub

    await removeTagsFromTaskUseCase.execute({
      taskId,
      tagId,
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
