import type { Prisma, Tag } from 'generated/prisma/index.js'

export interface TagsRepository {
  findById(id: string): Promise<Tag | null>
  findByNameAndUserId(name: string, userId: string): Promise<Tag | null>
  findByName(name: string): Promise<Tag | null>
  findManyByIds(ids: string[]): Promise<Tag[]>
  findManyByName(name: string, page: number): Promise<Tag[]>
  update(id: string, data: Prisma.TagUpdateInput): Promise<Tag>
  create(data: Prisma.TagCreateInput): Promise<Tag>
}
