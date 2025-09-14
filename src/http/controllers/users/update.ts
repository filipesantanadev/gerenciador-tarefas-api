import { CurrentPasswordIsRequiredError } from '@/use-cases/errors/current-password-is-required-error.ts'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error.ts'
import { PasswordsDoNotMatchError } from '@/use-cases/errors/passwords-do-not-match.ts'
import { SameNewPasswordAndCurrentPasswordError } from '@/use-cases/errors/same-new-password-and-current-password-error.ts'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error.ts'
import { makeUpdateUserProfileUseCase } from '@/use-cases/factories/users/make-update-user-profile-use-case.ts'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBodySchema = z
    .object({
      name: z.string().optional(),
      email: z.string().email('Invalid email format').toLowerCase().optional(),
      currentPassword: z.string().min(6).optional(),
      newPassword: z.string().min(6).optional(),
      confirmPassword: z.string().min(6).optional(),
    })
    .refine(
      (data) => {
        if (data.newPassword) {
          return !!data.currentPassword
        }
        return true
      },
      {
        message: 'Current password is required when updating password',
        path: ['currentPassword'],
      },
    )
    .refine(
      (data) => {
        if (data.currentPassword) {
          return !!data.newPassword
        }
        return true
      },
      {
        message: 'New password is required when providing current password',
        path: ['newPassword'],
      },
    )
    .refine(
      (data) => {
        if (data.currentPassword && data.newPassword) {
          return data.currentPassword !== data.newPassword
        }
        return true
      },
      {
        message: 'New password must be different from current password',
        path: ['newPassword'],
      },
    )
    .refine(
      (data) => {
        if (data.newPassword) {
          return data.newPassword === data.confirmPassword
        }
        return true
      },
      {
        message: 'Password confirmation does not match new password',
        path: ['confirmPassword'],
      },
    )

  try {
    const { name, email, currentPassword, newPassword, confirmPassword } =
      updateBodySchema.parse(request.body)

    const updateUserProfileUseCase = makeUpdateUserProfileUseCase()

    await updateUserProfileUseCase.execute({
      id: request.user.sub,
      ...(name && { name }),
      ...(email && { email }),
      ...(currentPassword &&
        newPassword &&
        confirmPassword && {
          currentPassword,
          newPassword,
          confirmPassword,
        }),
    })

    return reply.status(200).send({ message: 'Profile updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.issues,
      })
    }

    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    if (error instanceof PasswordsDoNotMatchError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof InvalidCredentialsError) {
      return reply
        .status(400)
        .send({ message: 'Current password is incorrect' })
    }

    if (error instanceof CurrentPasswordIsRequiredError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof SameNewPasswordAndCurrentPasswordError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
