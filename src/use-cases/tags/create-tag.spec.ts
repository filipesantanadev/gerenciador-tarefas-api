import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { CreateTagUseCase } from './create-tag.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { TagNameCannotBeEmptyError } from '../errors/tag-name-cannot-be-empty-error-.ts'
import { TagNameTooLongError } from '../errors/tag-name-too-long-error.ts'

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
      createdBy: 'user-1',
    })

    expect(tag.id).toEqual(expect.any(String))
  })

  it('should not be able to create tag with name empty', async () => {
    await expect(() =>
      sut.execute({
        name: '',
        color: '#EF4444',
        createdBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TagNameCannotBeEmptyError)
  })

  it('should not be able to create tag with name empty', async () => {
    await expect(() =>
      sut.execute({
        name: '',
        color: '#EF4444',
        createdBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TagNameCannotBeEmptyError)
  })

  it('should not be able to create tag with name more 25 characters', async () => {
    await expect(() =>
      sut.execute({
        name: '    Labore culpa irure veniam id. Consectetur excepteur ipsum ipsum dolor aliquip ad ad laborum officia mollit magna. Elit et deserunt cillum qui. Ad laborum mollit ea cupidatat veniam quis. Ad sunt aliqua magna sit aliqua laboris laborum adipisicing sint culpa enim. ',
        color: '#EF4444',
        createdBy: 'user-1',
      }),
    ).rejects.toBeInstanceOf(TagNameTooLongError)
  })

  it('should be able trim whitespace from tag description', async () => {
    const { tag } = await sut.execute({
      name: 'work',
      description: '  Work Test ',
      color: '#EF4444',
      createdBy: 'user-1',
    })

    expect(tag.id).toEqual(expect.any(String))
  })
})
