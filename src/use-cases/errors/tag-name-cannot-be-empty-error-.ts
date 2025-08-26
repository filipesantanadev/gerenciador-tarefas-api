export class TagNameCannotBeEmptyError extends Error {
  constructor() {
    super('Tag name cannot be empty.')
  }
}
