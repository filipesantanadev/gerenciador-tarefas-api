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

  it('should be able to list tags', async () => {
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
      name: 'Urgente',
      page: 1,
    })

    expect(tags).toHaveLength(2)
  })

  it('should not be able to list tags when tag not exists', async () => {
    const { tags } = await sut.execute({
      name: 'Teste',
      page: 1,
    })

    expect(tags).toEqual([])
  })

  it('should not be able to list tags when tag with name not exists', async () => {
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
      name: 'Teste',
      page: 1,
    })

    expect(tags).toEqual([])
  })
})
