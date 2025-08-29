import type { Prisma, Task } from 'generated/prisma/index.js'

export interface FindManyParams {
  userId: string
  query?: string
  status?: string
  categoryId?: string
  priority?: string
  dueDate?: Date
  page?: number
  includeArchived?: boolean
  orderBy?: 'createdAt' | 'dueDate' | 'priority'
  order?: 'asc' | 'desc'
}

export interface TasksRepository {
  findById(id: string): Promise<Task | null>
  findMany(params: FindManyParams): Promise<Task[]>
  findByCategoryId(categoryId: string): Promise<Task[]>
  delete(id: string): Promise<Task | null>
  update(id: string, data: Prisma.TaskUpdateInput): Promise<Task>
  create(data: Prisma.TaskUncheckedCreateInput): Promise<Task>
}
