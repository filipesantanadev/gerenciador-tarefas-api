import type { Prisma, Task } from 'generated/prisma/index.js'

export interface TasksRepository {
  create(data: Prisma.TaskUncheckedCreateInput): Promise<Task>
}
