import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { Category } from 'generated/prisma/index.js'

interface ListCategoriesUseCaseRequest {
  userId: string
}

interface ListCategoriesUseCaseResponse {
  categories: Category[]
}

export class ListCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    userId,
  }: ListCategoriesUseCaseRequest): Promise<ListCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.findManyByUserId(userId)

    return { categories }
  }
}
