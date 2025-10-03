import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('Delete Category (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to delete category', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    futureDate.setHours(12, 0, 0, 0)

    const user = await prisma.user.findFirstOrThrow()

    const category = await prisma.category.create({
      data: {
        name: 'University',
        description: 'All tasks of university',
        color: '#0ABAAA',
        icon: '📚',
        is_default: false,
        user_id: user.id,
      },
    })

    const task = await prisma.task.create({
      data: {
        title: 'Study JavaScript Fundamentals',
        description: 'Learn basic JavaScript concepts',
        status: 'TODO',
        priority: 'HIGH',
        due_date: futureDate,
        user_id: user.id,
        category_id: category.id,
      },
    })

    const response = await request(app.server)
      .delete(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(204)

    const deletedTask = await prisma.task.findUnique({
      where: {
        id: task.id,
      },
    })

    expect(deletedTask?.category_id).toBeNull()
  })
})
