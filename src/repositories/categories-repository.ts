import type { Category, Prisma } from 'generated/prisma/index.js'

export interface CategoriesRepository {
  findManyByUserId(userId: string): Promise<Category[]>
  findByNameAndUserId(name: string, userId: string): Promise<Category | null>
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>
}
