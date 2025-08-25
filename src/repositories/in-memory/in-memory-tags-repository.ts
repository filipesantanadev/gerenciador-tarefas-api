import type { Prisma, Tag } from 'generated/prisma/index.js'
import type { TagsRepository } from '../tags-repository.ts'
import { randomUUID } from 'node:crypto'

export class InMemoryTagsRepository implements TagsRepository {
  public items: Tag[] = []

  async findByName(name: string) {
    const tag = this.items.filter((item) => item.name.includes(name))

    return tag
  }

  async create(data: Prisma.TagCreateInput) {
    const tag = {
      id: randomUUID(),
      name: data.name,
      color: data.color ?? '#6B7280',
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(tag)

    return tag
  }
}
