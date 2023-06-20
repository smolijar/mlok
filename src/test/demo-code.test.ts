import type { IncomingMessage } from 'node:http'
export interface ExecutionContext {
  switchToHttp(): {
    getRequest(): IncomingMessage
  }
}

export type User = { id: string }
export interface UserRepository {
  getUserByToken(token: string): User
  getUserById(id: string): User
}

export class AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  public async authenticate(ctx: ExecutionContext): Promise<User | null> {
    const token = this.extractJWT(ctx)
    if (!token) {
      return null
    }
    return this.userRepository.getUserByToken(token)
  }

  private extractJWT(ctx: ExecutionContext): string | null {
    const [, token] =
      ctx
        .switchToHttp()
        .getRequest()
        .headers.authorization?.toString()
        ?.match(/bearer (.*)/i) ?? []
    return token ?? null
  }
}
