import type { Category } from 'generated/prisma/index.js'
import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { CategoryAlreadyExistsError } from '../errors/category-already-exists-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'

interface UpdateCategoryUseCaseRequest {
  id: string
  name?: string
  description?: string
  color?: string
  icon?: string
  isDefault?: boolean
  userId: string
}

interface UpdateCategoryUseCaseResponse {
  category: Category
}

export class UpdateCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    name,
    description,
    color,
    icon,
    isDefault,
    userId,
  }: UpdateCategoryUseCaseRequest): Promise<UpdateCategoryUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const category = await this.categoriesRepository.findById(id)

    if (!category) {
      throw new ResourceNotFoundError()
    }

    if (category.userId !== userId) {
      throw new ResourceNotFoundError()
    }

    if (name) {
      const categoryWithSameTitle =
        await this.categoriesRepository.findByNameAndUserId(name, user.id)

      if (categoryWithSameTitle && categoryWithSameTitle.id !== id) {
        throw new CategoryAlreadyExistsError()
      }
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (color) updateData.color = color
    if (icon) updateData.icon = icon
    if (typeof isDefault === 'boolean') updateData.isDefault = isDefault

    if (Object.keys(updateData).length === 0) {
      throw new InvalidUpdateDataError()
    }

    const updatedCategory = await this.categoriesRepository.update(
      id,
      updateData,
    )

    return { category: updatedCategory }
  }
}
