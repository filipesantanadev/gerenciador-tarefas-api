import type { Prisma, Tag } from 'generated/prisma/index.js'

export interface TagsRepository {
  findById(id: string): Promise<Tag | null>
  findByName(name: string): Promise<Tag[]>
  findByNameAndId(name: string, id: string): Promise<Tag | null>
  update(id: string, data: Prisma.TagUpdateInput): Promise<Tag>
  create(data: Prisma.TagCreateInput): Promise<Tag>
}
