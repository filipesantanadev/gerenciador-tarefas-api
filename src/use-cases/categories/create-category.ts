import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { UsersRepository } from '@/repositories/users-repository.ts'
import type { Category } from 'generated/prisma/index.js'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error.ts'
import { CategoryAlreadyExistsError } from '../errors/category-already-exists-error.ts'

interface CreateCategoryUseCaseRequest {
  name: string
  description?: string
  color?: string
  icon?: string
  isDefault?: boolean
  userId: string
}

interface CreateCategoryUseCaseResponse {
  category: Category
}

export class CreateCategoryUseCase {
  constructor(
    private categoriesRepository: CategoriesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    name,
    description,
    color,
    icon,
    isDefault,
    userId,
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    const userExists = await this.usersRepository.findById(userId)

    if (!userExists) {
      throw new InvalidCredentialsError()
    }

    // Validar nome único por usuário
    const existingCategory =
      await this.categoriesRepository.findByNameAndUserId(name, userId)
    if (existingCategory) {
      throw new CategoryAlreadyExistsError()
    }

    const category = await this.categoriesRepository.create({
      name,
      description: description || null,
      color: color || '#3B82F6',
      icon: icon || null,
      isDefault: isDefault || false,
      userId,
    })

    return { category }
  }
}
