import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { AuthenticateUseCase } from '@/use-cases/users/authenticate.ts'

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new AuthenticateUseCase(usersRepository)

  return useCase
}
