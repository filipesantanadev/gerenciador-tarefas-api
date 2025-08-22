export class PasswordsDoNotMatch extends Error {
  constructor() {
    super('Password and confirmation do not match.')
  }
}
