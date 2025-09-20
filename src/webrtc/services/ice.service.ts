import { Injectable } from '@nestjs/common';
import { createHmac, randomUUID, UUID } from 'crypto';

@Injectable()
export class IceService {
  private readonly secret = process.env.TURN_SECRET!;
  private readonly host = process.env.TURN_HOST!;
  private readonly ttlSec = Number(process.env.TURN_TTL ?? 3600);

  private genTurnCredentials(userId = randomUUID()) {
    const expiry = Math.floor(Date.now() / 1000) + this.ttlSec;
    const username = `${expiry}:${userId}`;
    const credential = createHmac('sha1', this.secret)
      .update(username)
      .digest('base64');
    return { username, credential, expiry };
  }

  getIceConfig(userId?: string) {
    const { username, credential } = this.genTurnCredentials(userId as UUID);
    return {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        {
          urls: [
            `turn:${this.host}:3478?transport=udp`,
            `turn:${this.host}:3478?transport=tcp`,
            // For TLS
            // `turns:${this.host}:5349?transport=tcp`,
          ],
          username,
          credential,
        },
      ],
      ttl: this.ttlSec,
    };
  }
}
