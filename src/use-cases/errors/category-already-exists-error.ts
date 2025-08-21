export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super('Category with this name already exists.')
  }
}
