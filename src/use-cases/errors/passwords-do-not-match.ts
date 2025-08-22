export class PasswordsDoNotMatchError extends Error {
  constructor() {
    super('Password and confirmation do not match.')
  }
}
