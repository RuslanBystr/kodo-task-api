import { Request } from 'express';
import { JwtPayload } from '../../common/types/jwt-payload.type';

export type AuthRequest = Request & { user: JwtPayload };
