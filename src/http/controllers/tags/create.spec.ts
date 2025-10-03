import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Create Tag (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a tag', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const user = await prisma.user.findFirstOrThrow()

    const response = await request(app.server)
      .post('/tags')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Important',
        color: '#EF4444',
        description: 'Critical tasks',
        created_by: user.id,
      })

    expect(response.statusCode).toEqual(201)
    expect(response.body.tag.name).toEqual('Important')
  })
})
