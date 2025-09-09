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

  async findManyByUserId(userId: string, page: number) {
    const categories = this.items
      .filter((item) => item.user_id === userId)
      .slice((page - 1) * 20, page * 20)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

    return categories
  }

  async findByNameAndUserId(name: string, userId: string) {
    const category = this.items.find(
      (item) => item.name === name && item.user_id === userId,
    )

    if (!category) {
      return null
    }

    return category
  }

  async delete(id: string) {
    const categoryToRemove = this.items.find((item) => item.id === id)

    if (!categoryToRemove) {
      return null
    }

    this.items = this.items.filter((item) => item.id !== id)
    return categoryToRemove
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    const categoryIndex = this.items.findIndex((item) => item.id === id)

    if (categoryIndex === -1) throw new ResourceNotFoundError()

    const currentCategory = this.items[categoryIndex]

    if (!currentCategory) throw new ResourceNotFoundError()

    const updatedCategory: Category = {
      id: currentCategory.id,
      name: (data.name as string) ?? currentCategory.name,
      description: (data.description as string) ?? currentCategory.description,
      color: (data.color as string) ?? currentCategory.color,
      icon: (data.icon as string) ?? currentCategory.icon,
      is_default: (data.is_default as boolean) ?? currentCategory.is_default,
      created_at: currentCategory.created_at,
      updated_at: new Date(),
      user_id: currentCategory.user_id,
    }

    this.items[categoryIndex] = updatedCategory

    return updatedCategory
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    const category = {
      id: data.id ?? randomUUID(),
      name: data.name,
      description: data.description ?? null,
      color: (data.color as Category['color']) ?? '#3B82F6',
      icon: data.icon ?? null,
      is_default: data.is_default ?? false,
      user_id: data.user_id,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(category)

    return category
  }
}
