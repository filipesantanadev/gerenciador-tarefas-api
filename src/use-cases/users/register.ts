import type { UsersRepository } from '@/repositories/users-repository.ts'
import { hash } from 'bcryptjs'
import type { User } from 'generated/prisma/index.js'
import { PasswordsDoNotMatchError } from '../errors/passwords-do-not-match.ts'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error.ts'

interface RegisterUseCaseRequest {
  name: string
  email: string
  password: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const password_hash = await hash(password, 6)

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
    })

    return { user }
  }
}
