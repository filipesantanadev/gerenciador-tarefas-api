import type {
  Category,
  Priority,
  Prisma,
  Tag,
  Task,
  TaskStatus,
} from 'generated/prisma/index.js'

type OrderableFields = 'createdAt' | 'dueDate' | 'priority' | 'title'

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
  orderBy?: OrderableFields
  order?: 'asc' | 'desc'
}

export interface SearchTasksParams {
  userId: string
  query: string
  page?: number
  includeArchived?: boolean
}

export interface AdvancedFilterParams extends Omit<FindManyParams, 'orderBy'> {
  title?: string
  // Date filters
  dueDateFrom?: Date
  dueDateTo?: Date
  createdAfter?: Date
  createdBefore?: Date

  // Additional filters
  orderBy?: OrderableFields
  hasDescription?: boolean
  overdue?: boolean
}

export interface TaskWithRelations extends Task {
  category: Category | null
  tags: Tag[]
}

export interface TaskUpdateData {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  due_date?: Date | null
  completed_at?: Date | null
  is_archived?: boolean
  category_id?: string | null
}

export interface TasksRepository {
  removeTag(taskId: string, tagId: string): Promise<Task | null>
  addTags(taskId: string, tagIds: string[]): Promise<Task | null>
  existsByCategoryId(categoryId: string): Promise<boolean>
  findById(id: string): Promise<Task | null>
  findManyByCategoryId(
    categoryId: string,
    page: number,
  ): Promise<TaskWithRelations[]>
  findManyByTagId(tagId: string, page: number): Promise<TaskWithRelations[]>
  findMany(params: FindManyParams): Promise<TaskWithRelations[]>
  findManyWithAdvanceFilters(
    params: AdvancedFilterParams,
  ): Promise<TaskWithRelations[]>
  searchByText(params: SearchTasksParams): Promise<TaskWithRelations[]>
  delete(id: string): Promise<Task | null>
  update(id: string, data: Prisma.TaskUpdateInput): Promise<Task>
  updateWithTags(
    id: string,
    data: Prisma.TaskUpdateInput,
    tagIds: string[],
  ): Promise<Task>
  create(data: Prisma.TaskUncheckedCreateInput): Promise<Task>
}
