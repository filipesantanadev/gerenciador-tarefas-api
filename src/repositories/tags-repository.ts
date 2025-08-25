import type { Prisma, Tag } from 'generated/prisma/index.js'

export interface TagsRepository {
  findByName(name: string): Promise<Tag[]>
  create(data: Prisma.TagCreateInput): Promise<Tag>
}
