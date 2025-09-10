import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { RegisterUseCase } from '@/use-cases/users/register.ts'

export function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new RegisterUseCase(usersRepository)

  return useCase
}
