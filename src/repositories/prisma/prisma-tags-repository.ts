import type { Prisma } from 'generated/prisma/index.js'
import type { FindManyOptions, TagsRepository } from '../tags-repository.ts'
import { prisma } from '@/lib/prisma.ts'

export class PrismaTagsRepository implements TagsRepository {
  async findById(id: string) {
    const tag = await prisma.tag.findUnique({
      where: {
        id,
      },
    })
    return tag
  }

  async findByNameAndUserId(name: string, userId: string) {
    const tag = await prisma.tag.findFirst({
      where: {
        name,
        creator: { id: userId },
      },
    })
    return tag
  }

  async findByName(name: string) {
    const tag = await prisma.tag.findUnique({
      where: {
        name,
      },
    })
    return tag
  }

  async findManyByIds(ids: string[]) {
    const tags = await prisma.tag.findMany({
      where: {
        id: { in: ids },
      },
    })
    return tags
  }

  async findMany(params: FindManyOptions) {
    const { userId, page = 1, search, sortBy = 'name', order = 'asc' } = params

    const orderByConfig = {
      name: { name: order as 'asc' | 'desc' },
      created_at: { created_at: order as 'asc' | 'desc' },
    }

    const tags = await prisma.tag.findMany({
      where: {
        ...(userId && { created_by: userId }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: orderByConfig[sortBy],
      take: 20,
      skip: (page - 1) * 20,
    })

    return tags
  }

  async findManyByName(name: string, page: number) {
    const tags = await prisma.tag.findMany({
      where: {
        name,
      },
      take: 20,
      skip: (page - 1) * 20,
    })
    return tags
  }

  async delete(id: string) {
    const tag = await prisma.tag.delete({
      where: {
        id,
      },
    })
    return tag
  }

  async update(id: string, data: Prisma.TagUpdateInput) {
    const tag = await prisma.tag.update({
      where: { id },
      data,
    })
    return tag
  }

  async create(data: Prisma.TagCreateInput) {
    const tag = await prisma.tag.create({
      data,
    })

    return tag
  }
}
