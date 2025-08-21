import type { Prisma, Category } from 'generated/prisma/index.js'
import { randomUUID } from 'node:crypto'
import type { CategoriesRepository } from '../categories-repository.ts'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

  async findByNameAndUserId(name: string, userId: string) {
    const category = this.items.find(
      (item) => item.name === name && item.userId === userId,
    )

    if (!category) {
      return null
    }

    return category
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    const category = {
      id: randomUUID(),
      name: data.name,
      description: data.description || null,
      color: data.color || '#3B82F6',
      icon: data.icon || null,
      isDefault: data.isDefault || false,
      userId: data.userId,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(category)

    return category
  }
}
