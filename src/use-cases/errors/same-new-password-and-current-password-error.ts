export class SameNewPasswordAndCurrentPasswordError extends Error {
  constructor() {
    super('New password must be different from current password.')
  }
}
