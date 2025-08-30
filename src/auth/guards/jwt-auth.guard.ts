import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { STRATEGIES } from '../../common/enums';

@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGIES.JWT) {}
