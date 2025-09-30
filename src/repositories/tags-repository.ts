import type { Prisma, Tag } from 'generated/prisma/index.js'

export interface FindManyOptions {
  userId?: string
  page: number
  search?: string
  sortBy?: 'name' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface TagsRepository {
  findById(id: string): Promise<Tag | null>
  findByNameAndUserId(name: string, userId: string): Promise<Tag | null>
  findByName(name: string): Promise<Tag | null>
  findManyByIds(ids: string[]): Promise<Tag[]>
  findManyByName(name: string): Promise<Tag[]>
  findMany(params: FindManyOptions): Promise<Tag[]>
  delete(id: string): Promise<Tag | null>
  update(id: string, data: Prisma.TagUpdateInput): Promise<Tag>
  create(data: Prisma.TagCreateInput): Promise<Tag>
}
