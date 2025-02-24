import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGIES } from '../../common/enums/strategies';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(STRATEGIES.JWT_REFRESH_TOKEN) {}
