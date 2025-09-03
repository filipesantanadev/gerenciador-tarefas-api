import type { Category, Prisma, Tag, Task } from 'generated/prisma/index.js'

export interface FindManyParams {
  userId: string
  query?: string
  status?: string
  categoryId?: string
  tagIds?: string[]
  priority?: string
  dueDate?: Date
  page?: number
  includeArchived?: boolean
  orderBy?: 'createdAt' | 'dueDate' | 'priority'
  order?: 'asc' | 'desc'
}

export interface TaskWithRelations extends Task {
  category: Category | null
  tags: Tag[]
}

export interface TasksRepository {
  removeTag(taskId: string, tagId: string): Promise<Task | null>
  addTags(taskId: string, tagIds: string[]): Promise<Task | null>
  findById(id: string): Promise<Task | null>
  findMany(params: FindManyParams): Promise<TaskWithRelations[]>
  findByCategoryId(categoryId: string): Promise<Task[]>
  delete(id: string): Promise<Task | null>
  update(id: string, data: Prisma.TaskUpdateInput): Promise<Task>
  updateWithTags(
    id: string,
    data: Prisma.TaskUpdateInput,
    tagIds: string[],
  ): Promise<Task>
  create(data: Prisma.TaskUncheckedCreateInput): Promise<Task>
}
