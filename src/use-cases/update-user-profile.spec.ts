import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository.ts'
import { compare, hash } from 'bcryptjs'
import { UpdateUserProfileUseCase } from './update-user-profile.ts'
import { UserAlreadyExistsError } from './errors/user-already-exists-error.ts'
import { InvalidCredentialsError } from './errors/invalid-credentials-error.ts'
import { PasswordsDoNotMatchError } from './errors/passwords-do-not-match.ts'
import { ResourceNotFoundError } from './errors/resource-not-found-error.ts'
import { SameNewPasswordAndCurrentPasswordError } from './errors/same-new-password-and-current-password-error.ts'
import { CurrentPasswordIsRequiredError } from './errors/current-password-is-required-error.ts'

let usersRepository: InMemoryUsersRepository
let sut: UpdateUserProfileUseCase

describe('Update User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateUserProfileUseCase(usersRepository)
  })
  it('should be able to update profile user', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const updatedUser = await sut.execute({
      id: user.id,
      name: 'John F. Doe',
      email: 'new-email@example.com', // Email diferente
    })

    expect(updatedUser.user.id).toEqual(user.id)
    expect(updatedUser.user.name).toEqual('John F. Doe')
    expect(updatedUser.user.email).toEqual('new-email@example.com')
  })

  it('should be able to update user password', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user: updatedUser } = await sut.execute({
      id: user.id,
      currentPassword: '123456',
      newPassword: '123123',
      confirmPassword: '123123',
    })

    expect(updatedUser.id).toEqual(user.id)
    expect(updatedUser.password_hash).not.toEqual(user.password_hash) // Senha mudou

    // Verificar se nova senha funciona
    const isNewPasswordValid = await compare(
      '123123',
      updatedUser.password_hash,
    )
    expect(isNewPasswordValid).toBe(true)
  })

  it('should be able to update only user name', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user: updatedUser } = await sut.execute({
      id: user.id,
      name: 'John F. Doe', // Só mudando nome
    })

    expect(updatedUser.name).toEqual('John F. Doe')
    expect(updatedUser.email).toEqual(user.email) // Email mantido
    expect(updatedUser.password_hash).toEqual(user.password_hash) // Senha mantida
  })

  it('should be able to update only user email', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user: updatedUser } = await sut.execute({
      id: user.id,
      email: 'newemail@example.com', // Só mudando email
    })

    expect(updatedUser.email).toEqual('newemail@example.com')
    expect(updatedUser.name).toEqual(user.name) // Nome mantido
    expect(updatedUser.password_hash).toEqual(user.password_hash) // Senha mantida
  })

  it('should not be able to update profile user when not find user', async () => {
    await expect(() =>
      sut.execute({
        id: 'not-existing-id',
        name: 'John F. Doe',
        email: 'johnfdoe@example.com', // Email diferente
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update password with wrong current password', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: user.id,
        currentPassword: 'wrong-password', // ❌ Senha atual errada
        newPassword: '123123',
        confirmPassword: '123123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to update password without providing current password', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: user.id,
        newPassword: '123123', // ❌ Nova senha fornecida
        confirmPassword: '123123',
        // currentPassword não fornecida
      }),
    ).rejects.toBeInstanceOf(CurrentPasswordIsRequiredError)
  })

  it('should not be able to update profile user when password and confirm password do not match', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: user.id,
        name: 'John F. Doe',
        email: 'johnfdoe@example.com', // Email diferente
        currentPassword: '123456',
        newPassword: '123123',
        confirmPassword: '1231233',
      }),
    ).rejects.toBeInstanceOf(PasswordsDoNotMatchError)
  })

  it('should not be able to update profile user when update password equal old password', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: user.id,
        name: 'John F. Doe',
        email: 'johnfdoe@example.com',
        currentPassword: '123456', // Email diferente
        newPassword: '123456',
        confirmPassword: '123456',
      }),
    ).rejects.toBeInstanceOf(SameNewPasswordAndCurrentPasswordError)
  })

  it('should not be able to update user profile when email is already taken', async () => {
    const email = 'johndoe@example.com'
    const existingUser = await usersRepository.create({
      name: 'John Doe',
      email,
      password_hash: await hash('123456', 6),
    })

    const userToUpdate = await usersRepository.create({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        id: userToUpdate.id,
        name: 'Jane F. Doe',
        email: existingUser.email, // Email já usado por existingUser
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
