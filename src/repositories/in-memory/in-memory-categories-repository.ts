import type { Prisma, Category } from 'generated/prisma/index.js'
import { randomUUID } from 'node:crypto'
import type { CategoriesRepository } from '../categories-repository.ts'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items: Category[] = []

  async findById(id: string) {
    const category = this.items.find((item) => item.id === id)

    if (!category) return null

    return category
  }

  async findManyByUserId(userId: string) {
    const categories = this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

    return categories
  }

  async findByNameAndUserId(name: string, userId: string) {
    const category = this.items.find(
      (item) => item.name === name && item.userId === userId,
    )

    if (!category) {
      return null
    }

    return category
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    const categoryIndex = this.items.findIndex((item) => item.id === id)

    if (categoryIndex === -1) throw new ResourceNotFoundError()

    const currentCategory = this.items[categoryIndex]!

    const updatedCategory: Category = {
      id: currentCategory.id,
      name: (data.name as string) ?? currentCategory.name,
      description: (data.description as string) ?? currentCategory.description,
      color: (data.color as string) ?? currentCategory.color,
      icon: (data.icon as string) ?? currentCategory.icon,
      isDefault: (data.isDefault as boolean) ?? currentCategory.isDefault,
      created_at: currentCategory.created_at,
      updated_at: new Date(),
      userId: currentCategory.userId,
    }

    this.items[categoryIndex] = updatedCategory

    return updatedCategory
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
