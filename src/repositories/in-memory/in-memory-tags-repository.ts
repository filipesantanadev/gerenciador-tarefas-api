import type { Prisma, Tag } from 'generated/prisma/index.js'
import type { TagsRepository } from '../tags-repository.ts'
import { randomUUID } from 'node:crypto'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'

export class InMemoryTagsRepository implements TagsRepository {
  public items: Tag[] = []

  async findById(id: string) {
    const tag = this.items.find((item) => item.id === id)

    if (!tag) return null

    return tag
  }

  async findByName(name: string) {
    const tag = this.items.filter((item) => item.name.includes(name))

    return tag
  }

  async update(id: string, data: Prisma.TagUpdateInput) {
    const tagIndex = this.items.findIndex((item) => item.id === id)

    if (tagIndex === -1) throw new ResourceNotFoundError()

    const currentTag = this.items[tagIndex]

    if (!currentTag) throw new ResourceNotFoundError()

    const updatedTag: Tag = {
      id: currentTag.id,
      name: (data.name as string) ?? currentTag.name,
      color: (data.color as string) ?? currentTag.color,
      description: (data.description as string) ?? currentTag.description,
      usage_count: currentTag.usage_count,
      created_by: currentTag.created_by,
      created_at: currentTag.created_at,
      updated_at: new Date(),
    }

    this.items[tagIndex] = updatedTag

    return updatedTag
  }

  async create(data: Prisma.TagCreateInput) {
    const tag = {
      id: randomUUID(),
      name: data.name,
      color: data.color ?? '#6B7280',
      description: data.description ?? null,
      usage_count: 0,
      created_by: data.creator?.connect?.id ?? null,
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      updated_at: data.updated_at ? new Date(data.updated_at) : new Date(),
    }

    this.items.push(tag)

    return tag
  }
}
