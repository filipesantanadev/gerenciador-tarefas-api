import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Update User (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update user profile', async () => {
    const { token } = await createAndAuthenticateUser(app)

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
