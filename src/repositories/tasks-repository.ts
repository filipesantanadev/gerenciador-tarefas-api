import type { Prisma, Task } from 'generated/prisma/index.js'

export interface FindManyParams {
  userId: string
  query?: string
  status?: string
  categoryId?: string
  priority?: string
  dueDate?: Date
  page?: number
  orderBy?: 'createdAt' | 'dueDate' | 'priority'
  order?: 'asc' | 'desc'
}

export interface TasksRepository {
  findMany(params: FindManyParams): Promise<Task[]>
  create(data: Prisma.TaskUncheckedCreateInput): Promise<Task>
}
