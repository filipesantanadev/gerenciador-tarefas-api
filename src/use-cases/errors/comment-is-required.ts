export class CommentIsRequiredError extends Error {
  constructor() {
    super('Comment content is required.')
  }
}
