export class TitleIsRequiredError extends Error {
  constructor() {
    super('Title is required.')
  }
}
