import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';

function extractToken(client: Socket): string | null {
  const fromAuth = client.handshake.auth?.token as string | undefined;
  const fromHeader = client.handshake.headers?.authorization as
    | string
    | undefined;
  const fromQuery = client.handshake.query?.token as string | undefined;
  const raw = fromAuth || fromHeader || fromQuery;
  if (!raw) return null;
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = extractToken(client);
    if (!token) throw new UnauthorizedException('Missing auth token');

    try {
      const payload = this.jwt.verify(token);
      const uid = Number(payload.sub ?? payload.userId ?? payload.id);
      if (!uid || Number.isNaN(uid))
        throw new UnauthorizedException('Invalid user id in token');
      (client.data ??= {}).userId = uid;
      client.data.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
