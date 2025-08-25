import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { CreateTagUseCase } from './create-tag.ts'
import { beforeEach, describe, expect, it } from 'vitest'

let tagsRepository: InMemoryTagsRepository
let sut: CreateTagUseCase

describe('Create Tag Use Case', () => {
  beforeEach(() => {
    tagsRepository = new InMemoryTagsRepository()
    sut = new CreateTagUseCase(tagsRepository)
  })

  it('should be able to create tag', async () => {
    const { tag } = await sut.execute({
      name: 'Urgente',
      color: '#EF4444',
    })

    expect(tag.id).toEqual(expect.any(String))
  })
})
