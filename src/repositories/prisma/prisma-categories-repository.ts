import type { Prisma } from 'generated/prisma/index.js'
import type { CategoriesRepository } from '../categories-repository.ts'
import { prisma } from '@/lib/prisma.ts'

export class PrismaCategoriesRepository implements CategoriesRepository {
  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    })
    return category
  }

  async findManyByUserId(userId: string, page: number) {
    const categories = await prisma.category.findMany({
      where: {
        user_id: userId,
      },
      take: 20,
      skip: (page - 1) * 20,
    })
    return categories
  }

  async findByNameAndUserId(name: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: {
        name,
        user_id: userId,
      },
    })
    return category
  }

  async delete(id: string) {
    const category = await prisma.category.delete({
      where: {
        id,
      },
    })
    return category
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    const category = await prisma.category.update({
      where: {
        id,
      },
      data,
    })
    return category
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    const category = await prisma.category.create({
      data,
    })
    return category
  }
}
