import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error.ts'
import { makeRegisterUseCase } from '@/use-cases/factories/auth/make-register-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z
    .object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'The passwords do not match',
      path: ['confirmPassword'],
    })

  try {
    const { name, email, password } = registerBodySchema.parse(request.body)

    const registerUseCase = makeRegisterUseCase()

    await registerUseCase.execute({
      name,
      email,
      password,
    })

    return reply.status(201).send()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        error,
      })
    }

    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
