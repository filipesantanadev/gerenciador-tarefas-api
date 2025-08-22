import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { User } from 'generated/prisma/index.js'
import { compare, hash } from 'bcryptjs'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { CurrentPasswordIsRequiredError } from '../errors/current-password-is-required-error.ts'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import { PasswordsDoNotMatchError } from '../errors/passwords-do-not-match.ts'
import { SameNewPasswordAndCurrentPasswordError } from '../errors/same-new-password-and-current-password-error.ts'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error.ts'

interface UpdateUserProfileUseCaseRequest {
  id: string
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface UpdateUserProfileUseCaseResponse {
  user: User
}

export class UpdateUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
    name,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
  }: UpdateUserProfileUseCaseRequest): Promise<UpdateUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (newPassword) {
      if (!currentPassword) {
        throw new CurrentPasswordIsRequiredError()
      }

      const isCurrentPasswordValid = await compare(
        currentPassword,
        user.password_hash,
      )
      if (!isCurrentPasswordValid) {
        throw new InvalidCredentialsError()
      }

      if (newPassword !== confirmPassword) {
        throw new PasswordsDoNotMatchError()
      }

      const isSamePassword = await compare(newPassword, user.password_hash)
      if (isSamePassword) {
        throw new SameNewPasswordAndCurrentPasswordError()
      }
    }

    if (email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(email)
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new UserAlreadyExistsError()
      }
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (newPassword) {
      updateData.password_hash = await hash(newPassword, 6)
    }

    const updatedUser = await this.usersRepository.update(id, updateData)

    return { user: updatedUser }
  }
}
