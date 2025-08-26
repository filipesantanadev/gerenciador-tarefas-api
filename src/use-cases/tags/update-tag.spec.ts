import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { UpdateTagUseCase } from './update-tag.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { TagAlreadyExistsError } from '../errors/tag-already-exists-error.ts'
import { InvalidUpdateDataError } from '../errors/invalid-update-data-error.ts'

let tagsRepository: InMemoryTagsRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateTagUseCase

describe('Update Tag Use Case', () => {
  beforeEach(async () => {
    tagsRepository = new InMemoryTagsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateTagUseCase(tagsRepository, usersRepository)
  })

  it('should be able to update tag', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const category = await tagsRepository.create({
      name: 'JavaScript',
      color: '#AAA3D8',
    })

    const updatedCategory = await sut.execute({
      id: category.id,
      description: 'TypeScript',
      created_by: user.id,
    })

    expect(updatedCategory.tag.id).toEqual(category.id)
    expect(updatedCategory.tag.description).toEqual('TypeScript')
  })

  it('should be able to update all tags fields', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const tag = await tagsRepository.create({
      name: 'Work',
      description: 'Old description',
      color: '#FF0000',
      creator: {
        connect: { id: user.id },
      },
    })

    const { tag: updated } = await sut.execute({
      id: tag.id,
      name: 'Novo',
      description: 'New description',
      color: '#0000FF',
      created_by: user.id,
    })

    expect(updated.name).toEqual('Novo')
    expect(updated.description).toBe('New description')
    expect(updated.color).toBe('#0000FF')
  })

  it('should not be able to update tag when user does not exist', async () => {
    const userId = 'no-existing-user'

    const tag = await tagsRepository.create({
      name: 'JavaScript',
      creator: { connect: { id: userId } },
    })

    await expect(() =>
      sut.execute({
        id: tag.id,
        description: 'Work test',
        created_by: userId,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a non-existing tag', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: 'not-existing-id-tag',
        description: 'Work test',
        created_by: user.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not update a category when same name tag exists', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await tagsRepository.create({
      name: 'Work',
      description: 'Work category',
      color: '#FF0000',
    })

    const tag = await tagsRepository.create({
      name: 'Personal',
      description: 'Personal Tag',
      color: '#fff',
    })

    await expect(() =>
      sut.execute({
        id: tag.id,
        name: 'Work',
        created_by: user.id,
      }),
    ).rejects.toBeInstanceOf(TagAlreadyExistsError)
  })

  it('should not update a tag when no fields are provided', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const tag = await tagsRepository.create({
      name: 'Work',
      description: 'Work category',
      color: '#FF0000',
      creator: { connect: { id: user.id } },
    })

    await expect(() =>
      sut.execute({
        id: tag.id,
        created_by: user.id,
      }),
    ).rejects.toBeInstanceOf(InvalidUpdateDataError)
  })
})
