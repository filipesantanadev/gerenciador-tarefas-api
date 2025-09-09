import type { CategoriesRepository } from '@/repositories/categories-repository.ts'
import type { Category } from 'generated/prisma/index.js'

interface ListCategoriesUseCaseRequest {
  userId: string
  page: number
}

interface ListCategoriesUseCaseResponse {
  categories: Category[]
}

export class ListCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    userId,
    page,
  }: ListCategoriesUseCaseRequest): Promise<ListCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.findManyByUserId(
      userId,
      page,
    )

    return { categories }
  }
}
