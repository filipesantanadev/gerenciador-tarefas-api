import request from 'supertest'
import { app } from '@/app.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma.ts'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user.ts'

describe('List Category (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list categories', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const user = await prisma.user.findFirstOrThrow()

    // Trabalho & Carreira
    await prisma.category.create({
      data: {
        name: 'Work',
        description: 'Professional tasks and projects',
        color: '#3B82F6',
        icon: '💼',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Meetings',
        description: 'Scheduled meetings and calls',
        color: '#8B5CF6',
        icon: '🤝',
        is_default: false,
        user_id: user.id,
      },
    })

    // Educação
    await prisma.category.create({
      data: {
        name: 'University',
        description: 'All tasks of university',
        color: '#0ABAAA',
        icon: '📚',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Learning',
        description: 'Courses, tutorials and self-study',
        color: '#10B981',
        icon: '🎓',
        is_default: false,
        user_id: user.id,
      },
    })

    // Saúde & Bem-estar
    await prisma.category.create({
      data: {
        name: 'Health',
        description: 'Medical appointments and health tracking',
        color: '#EF4444',
        icon: '❤️',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Fitness',
        description: 'Workout routines and exercise goals',
        color: '#F59E0B',
        icon: '💪',
        is_default: false,
        user_id: user.id,
      },
    })

    // Pessoal
    await prisma.category.create({
      data: {
        name: 'Personal',
        description: 'Personal errands and daily tasks',
        color: '#EC4899',
        icon: '🏠',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Shopping',
        description: 'Shopping lists and purchases',
        color: '#14B8A6',
        icon: '🛒',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Finance',
        description: 'Bills, payments and financial planning',
        color: '#22C55E',
        icon: '💰',
        is_default: false,
        user_id: user.id,
      },
    })

    // Lazer & Hobbies
    await prisma.category.create({
      data: {
        name: 'Hobbies',
        description: 'Personal projects and hobbies',
        color: '#A855F7',
        icon: '🎨',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Travel',
        description: 'Trip planning and travel arrangements',
        color: '#06B6D4',
        icon: '✈️',
        is_default: false,
        user_id: user.id,
      },
    })

    await prisma.category.create({
      data: {
        name: 'Social',
        description: 'Social events and gatherings',
        color: '#F472B6',
        icon: '🎉',
        is_default: false,
        user_id: user.id,
      },
    })

    // Família
    await prisma.category.create({
      data: {
        name: 'Family',
        description: 'Family-related tasks and events',
        color: '#FB923C',
        icon: '👨‍👩‍👧‍👦',
        is_default: false,
        user_id: user.id,
      },
    })

    // Projetos
    await prisma.category.create({
      data: {
        name: 'Side Projects',
        description: 'Personal side projects and ideas',
        color: '#6366F1',
        icon: '🚀',
        is_default: false,
        user_id: user.id,
      },
    })

    // Urgente/Importante
    await prisma.category.create({
      data: {
        name: 'Urgent',
        description: 'High priority and urgent tasks',
        color: '#DC2626',
        icon: '⚡',
        is_default: false,
        user_id: user.id,
      },
    })

    const response = await request(app.server)
      .get('/categories')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body.pagination.total).toEqual(15)
  })
})
