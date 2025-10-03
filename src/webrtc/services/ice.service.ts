import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createHmac, randomUUID } from 'crypto';

export type IceConfig = {
  iceServers: Array<
    | { urls: string | string[] }
    | { urls: string | string[]; username: string; credential: string }
  >;
  ttl: number;
  expiry?: number;
};

@Injectable()
export class IceService implements OnModuleInit {
  private readonly logger = new Logger(IceService.name);

  private readonly secret: string;
  private readonly host: string;
  private ttlSec: number;
  private readonly enableTls: boolean;
  private readonly turnPort: number;
  private readonly turnTlsPort: number;

  constructor() {
    this.secret =
      process.env.TURN_SECRET ??
      '9a79493b4c3c6cd249e5cda343336b48f77a5796a7cb81b1142ad4249fed27a2';
    this.host = process.env.TURN_HOST ?? '';
    this.ttlSec = Number(process.env.TURN_TTL ?? 3600);
    this.enableTls = (process.env.TURN_ENABLE_TLS ?? 'false') === 'true';
    this.turnPort = Number(process.env.TURN_PORT ?? 3478);
    this.turnTlsPort = Number(process.env.TURN_TLS_PORT ?? 5349);
  }

  onModuleInit() {
    if (!this.secret) {
      this.logger.error(
        'TURN_SECRET is not set. TURN credentials generation will fail.',
      );
      throw new Error('Missing TURN_SECRET env variable');
    }
    if (!this.host) {
      this.logger.error('TURN_HOST is not set.');
      throw new Error('Missing TURN_HOST env variable');
    }
    if (!Number.isFinite(this.ttlSec) || this.ttlSec <= 0) {
      this.logger.warn(
        `Invalid TURN_TTL="${process.env.TURN_TTL}", falling back to 3600s`,
      );
      this.ttlSec = 3600;
    }
  }

  private genTurnCredentials(userId?: number) {
    const id = userId ?? randomUUID();
    const expiry = Math.floor(Date.now() / 1000) + this.ttlSec;
    const username = `${expiry}:${id}`;

    const credential = createHmac('sha1', this.secret)
      .update(username)
      .digest('base64');

    return { username, credential, expiry };
  }

  getIceConfig(userId?: number): IceConfig {
    const { username, credential, expiry } = this.genTurnCredentials(userId);

    const iceServers: IceConfig['iceServers'] = [];

    iceServers.push({ urls: ['stun:stun.l.google.com:19302'] });

    // TURN (udp/tcp)
    iceServers.push({
      urls: [
        `turn:${this.host}:${this.turnPort}?transport=udp`,
        `turn:${this.host}:${this.turnPort}?transport=tcp`,
      ],
      username,
      credential,
    });

    if (this.enableTls) {
      iceServers.push({
        urls: `turns:${this.host}:${this.turnTlsPort}?transport=tcp`,
        username,
        credential,
      });
    }

    return { iceServers, ttl: this.ttlSec, expiry };
  }
}
