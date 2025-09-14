import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Update User (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update user profile', async () => {
    await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
      confirmPassword: '123456',
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email: 'johndoe@example.com',
      password: '123456',
    })

    const { token } = authResponse.body

    await request(app.server).get('/me').set('Authorization', `Bearer ${token}`)

    const updateUserResponse = await request(app.server)
      .patch('/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe Updated',
        email: 'johndoeofficial@example.com',
        currentPassword: '123456',
        newPassword: 'senhanova',
        confirmPassword: 'senhanova',
      })

    expect(updateUserResponse.statusCode).toEqual(200)
    expect(updateUserResponse.body.message).toEqual(
      'Profile updated successfully',
    )
  })
})
