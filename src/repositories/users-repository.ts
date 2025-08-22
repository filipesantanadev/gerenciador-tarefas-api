import type { Prisma, User } from 'generated/prisma/index.js'

export interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>
  create(data: Prisma.UserCreateInput): Promise<User>
}
