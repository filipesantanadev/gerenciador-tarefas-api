import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from '../errors/resource-not-found-error.ts'
import { UnauthorizedError } from '../errors/unauthorized-error.ts'
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository.ts'
import { DeleteTagUseCase } from './delete-tag.ts'

let usersRepository: InMemoryUsersRepository
let tagsRepository: InMemoryTagsRepository
let sut: DeleteTagUseCase

describe('Delete Tag Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    tagsRepository = new InMemoryTagsRepository()
    sut = new DeleteTagUseCase(tagsRepository, usersRepository)

    await usersRepository.create({
      id: 'user-1',
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await tagsRepository.create({
      id: 'tag-1',
      name: 'Work',
      creator: { connect: { id: 'user-1' } },
    })
  })

  it('should be able to delete tag', async () => {
    await sut.execute({
      id: 'tag-1',
      created_by: 'user-1',
    })

    const tag = await tagsRepository.findById('tag-1')
    expect(tag).toBeNull()
  })

  it('should not be able to delete tag with non-existent user', async () => {
    await expect(() =>
      sut.execute({
        id: 'tag-1',
        created_by: 'nonexisting-user',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete non-existent tag', async () => {
    await expect(() =>
      sut.execute({
        id: 'nonexisting-tag',
        created_by: 'user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete tag created by another user', async () => {
    await usersRepository.create({
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: 'tag-1',
        created_by: 'user-2',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
