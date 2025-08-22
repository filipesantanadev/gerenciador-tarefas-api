import type { User, Prisma, UserRole } from 'generated/prisma/index.js'
import type { UsersRepository } from '../users-repository.ts'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const userIndex = this.items.findIndex((item) => item.id === id)

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const currentUser = this.items[userIndex]!

    const updatedUser: User = {
      id: currentUser.id,
      name: (data.name as string) ?? currentUser.name,
      email: (data.email as string) ?? currentUser.email,
      password_hash:
        (data.password_hash as string) ?? currentUser.password_hash,
      role: (data.role as UserRole) ?? currentUser.role,
      created_at: currentUser.created_at,
      updated_at: new Date(),
    }

    this.items[userIndex] = updatedUser

    return updatedUser
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      role: data.role ?? 'USER',
      password_hash: data.password_hash,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(user)

    return user
  }
}
