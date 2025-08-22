export class CurrentPasswordIsRequiredError extends Error {
  constructor() {
    super('Current password is required.')
  }
}
