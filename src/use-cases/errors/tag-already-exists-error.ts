export class TagAlreadyExistsError extends Error {
  constructor() {
    super('Tag with this name already exists.')
  }
}
