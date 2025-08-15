import { Request } from 'express';
import { JwtPayload } from '../../common/types';

export type AuthRequest = Request & { user: JwtPayload };
