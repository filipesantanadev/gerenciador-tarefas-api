export class TagNameTooLongError extends Error {
  constructor(actualLength: number, maxLength: number) {
    super(`Tag name is too long (${actualLength}/${maxLength} characters)`)
  }
}
