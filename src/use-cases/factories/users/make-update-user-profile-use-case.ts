import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository.ts'
import { UpdateUserProfileUseCase } from '@/use-cases/users/update-user-profile.ts'

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateUserProfileUseCase(usersRepository)

  return useCase
}
