import { prisma } from '@/lib/prisma.ts'
import type { Prisma } from 'generated/prisma/index.js'

export class PrismaUsersRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }
}
