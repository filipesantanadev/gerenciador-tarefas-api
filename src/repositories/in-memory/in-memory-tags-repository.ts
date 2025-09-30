import type { Prisma, Tag } from 'generated/prisma/index.js'
import type { FindManyOptions, TagsRepository } from '../tags-repository.ts'
import { randomUUID } from 'node:crypto'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error.ts'

export class InMemoryTagsRepository implements TagsRepository {
  public items: Tag[] = []
  constructor(tags: Tag[] = []) {
    this.items = tags
  }

  async findById(id: string) {
    const tag = this.items.find((item) => item.id === id)

    if (!tag) return null

    return tag
  }

  async findByNameAndUserId(name: string, userId: string) {
    const tag = this.items.find(
      (item) => item.name === name && item.created_by === userId,
    )

    if (!tag) {
      return null
    }

    return tag
  }

  async findManyByIds(ids: string[]) {
    const items = this.items.filter((item) => ids.includes(item.id))

    return items
  }

  async findMany(params: FindManyOptions) {
    const { userId, page = 1, search, sortBy = 'name', order = 'asc' } = params

    let filteredTags = [...this.items]

    if (userId) {
      filteredTags = filteredTags.filter((tag) => tag.created_by === userId)
    }

    if (search) {
      filteredTags = filteredTags.filter((tag) =>
        tag.name.toLowerCase().includes(search.toLowerCase()),
      )
    }

    filteredTags.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'created_at') {
        comparison = a.created_at.getTime() - b.created_at.getTime()
      }

      return order === 'asc' ? comparison : -comparison
    })

    const startIndex = (page - 1) * 20
    const endIndex = startIndex + 20

    return filteredTags.slice(startIndex, endIndex)
  }

  async findManyByName(name: string, page: number) {
    const tag = this.items
      .filter((item) => item.name.includes(name))
      .slice((page - 1) * 20, page * 20)

    return tag
  }

  async findByName(name: string) {
    const tag = this.items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    )

    return tag || null
  }

  async delete(id: string) {
    const tagToRemove = this.items.find((item) => item.id === id)

    if (!tagToRemove) {
      return null
    }

    this.items = this.items.filter((item) => item.id !== id)
    return tagToRemove
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
      id: data.id ?? randomUUID(),
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
