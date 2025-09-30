import { beforeEach, describe, expect, it } from 'vitest'
import { ListTagsUseCase } from './list-tags.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'

let tagsRepository: InMemoryTagsRepository
let sut: ListTagsUseCase

describe('List Tags Use Case', () => {
  beforeEach(() => {
    tagsRepository = new InMemoryTagsRepository()
    sut = new ListTagsUseCase(tagsRepository)
  })

  it('should be able to search tags by name', async () => {
    await tagsRepository.create({
      name: 'Urgente',
      color: '#F74C21',
    })

    await tagsRepository.create({
      name: 'Urgente 2',
      color: '#00CC00',
    })

    await tagsRepository.create({
      name: 'Todo',
      color: '#0000FF',
    })

    const { tags } = await sut.execute({
      search: 'Urgente',
      page: 1,
    })

    expect(tags).toHaveLength(2)
    expect(tags[0]?.name).toContain('Urgente')
    expect(tags[1]?.name).toContain('Urgente')
  })

  it('should return empty array when no tags exist', async () => {
    const { tags } = await sut.execute({
      page: 1,
    })

    expect(tags).toEqual([])
  })

  it('should return empty array when search does not match any tag', async () => {
    await tagsRepository.create({
      name: 'Urgente',
      color: '#F74C21',
    })

    await tagsRepository.create({
      name: 'Todo',
      color: '#0000FF',
    })

    const { tags } = await sut.execute({
      search: 'NonExistent',
      page: 1,
    })

    expect(tags).toEqual([])
  })

  it('should list all tags when no search parameter is provided', async () => {
    await tagsRepository.create({
      name: 'Urgente',
      color: '#F74C21',
    })

    await tagsRepository.create({
      name: 'Todo',
      color: '#0000FF',
    })

    await tagsRepository.create({
      name: 'Review',
      color: '#00FF00',
    })

    const { tags } = await sut.execute({
      page: 1,
    })

    expect(tags).toHaveLength(3)
  })

  it('should sort tags alphabetically in ascending order', async () => {
    await tagsRepository.create({
      name: 'Zebra',
      color: '#FF0000',
    })

    await tagsRepository.create({
      name: 'Apple',
      color: '#00FF00',
    })

    await tagsRepository.create({
      name: 'Mango',
      color: '#0000FF',
    })

    const { tags } = await sut.execute({
      page: 1,
      sortBy: 'name',
      order: 'asc',
    })

    expect(tags[0]?.name).toBe('Apple')
    expect(tags[1]?.name).toBe('Mango')
    expect(tags[2]?.name).toBe('Zebra')
  })

  it('should sort tags alphabetically in descending order', async () => {
    await tagsRepository.create({
      name: 'Zebra',
      color: '#FF0000',
    })

    await tagsRepository.create({
      name: 'Apple',
      color: '#00FF00',
    })

    await tagsRepository.create({
      name: 'Mango',
      color: '#0000FF',
    })

    const { tags } = await sut.execute({
      page: 1,
      sortBy: 'name',
      order: 'desc',
    })

    expect(tags[0]?.name).toBe('Zebra')
    expect(tags[1]?.name).toBe('Mango')
    expect(tags[2]?.name).toBe('Apple')
  })

  it('should filter tags by userId when provided', async () => {
    await tagsRepository.create({
      name: 'User 1 Tag',
      color: '#FF0000',
      creator: { connect: { id: 'user-1' } },
    })

    await tagsRepository.create({
      name: 'User 2 Tag',
      color: '#00FF00',
      creator: { connect: { id: 'user-2' } },
    })

    await tagsRepository.create({
      name: 'Another User 1 Tag',
      color: '#0000FF',
      creator: { connect: { id: 'user-1' } },
    })

    const { tags } = await sut.execute({
      page: 1,
      userId: 'user-1',
    })

    expect(tags).toHaveLength(2)
    expect(tags.every((tag) => tag.created_by === 'user-1')).toBe(true)
  })

  it('should handle pagination correctly', async () => {
    for (let i = 1; i <= 25; i++) {
      await tagsRepository.create({
        name: `Tag ${i.toString().padStart(2, '0')}`,
        color: '#FF0000',
      })
    }

    const page1 = await sut.execute({ page: 1 })
    const page2 = await sut.execute({ page: 2 })

    expect(page1.tags).toHaveLength(20)
    expect(page2.tags).toHaveLength(5)
    expect(page1.tags[0]?.name).not.toBe(page2.tags[0]?.name)
  })

  it('should search tags case-insensitively', async () => {
    await tagsRepository.create({
      name: 'Urgente',
      color: '#F74C21',
    })

    const { tags } = await sut.execute({
      search: 'urgente',
      page: 1,
    })

    expect(tags).toHaveLength(1)
    expect(tags[0]?.name).toBe('Urgente')
  })

  it('should search tags with partial match', async () => {
    await tagsRepository.create({
      name: 'Urgente',
      color: '#F74C21',
    })

    await tagsRepository.create({
      name: 'Todo',
      color: '#0000FF',
    })

    const { tags } = await sut.execute({
      search: 'Urg',
      page: 1,
    })

    expect(tags).toHaveLength(1)
    expect(tags[0]?.name).toBe('Urgente')
  })

  it('should sort tags by creation date', async () => {
    const tag1 = await tagsRepository.create({
      name: 'First',
      color: '#FF0000',
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    const tag2 = await tagsRepository.create({
      name: 'Second',
      color: '#00FF00',
    })

    const { tags } = await sut.execute({
      page: 1,
      sortBy: 'created_at',
      order: 'asc',
    })

    expect(tags[0]?.id).toBe(tag1.id)
    expect(tags[1]?.id).toBe(tag2.id)
  })

  it('should combine search and userId filters', async () => {
    await tagsRepository.create({
      name: 'Urgente User 1',
      color: '#FF0000',
      creator: { connect: { id: 'user-1' } },
    })

    await tagsRepository.create({
      name: 'Urgente User 2',
      color: '#00FF00',
      creator: { connect: { id: 'user-2' } },
    })

    await tagsRepository.create({
      name: 'Todo User 1',
      color: '#0000FF',
      creator: { connect: { id: 'user-1' } },
    })

    const { tags } = await sut.execute({
      page: 1,
      search: 'Urgente',
      userId: 'user-1',
    })

    expect(tags).toHaveLength(1)
    expect(tags[0]?.name).toBe('Urgente User 1')
  })

  it('should use default values when sortBy and order are not provided', async () => {
    await tagsRepository.create({ name: 'Zebra', color: '#FF0000' })
    await tagsRepository.create({ name: 'Apple', color: '#00FF00' })
    await tagsRepository.create({ name: 'Lion', color: '#B85E09' })

    const { tags } = await sut.execute({ page: 1 })

    expect(tags[0]?.name).toBe('Apple')
    expect(tags[1]?.name).toBe('Lion')
    expect(tags[2]?.name).toBe('Zebra')
  })
})
