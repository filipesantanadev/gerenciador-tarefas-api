import type { Prisma, Tag } from 'generated/prisma/index.js'

export interface TagsRepository {
  findManyByIds(ids: string[]): Promise<Tag[]>
  findById(id: string): Promise<Tag | null>
  findByName(name: string): Promise<Tag | null>
  findManyByName(name: string): Promise<Tag[]>
  update(id: string, data: Prisma.TagUpdateInput): Promise<Tag>
  create(data: Prisma.TagCreateInput): Promise<Tag>
}
