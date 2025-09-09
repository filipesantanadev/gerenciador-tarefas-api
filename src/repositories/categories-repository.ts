import type { Category, Prisma } from 'generated/prisma/index.js'

export interface CategoriesRepository {
  findById(id: string): Promise<Category | null>
  findManyByUserId(userId: string, page: number): Promise<Category[]>
  findByNameAndUserId(name: string, userId: string): Promise<Category | null>
  delete(id: string): Promise<Category | null>
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>
  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category>
}
