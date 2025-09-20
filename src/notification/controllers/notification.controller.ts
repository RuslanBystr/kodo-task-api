import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';

import {
  MOCK_NOTIFICATIONS,
  NotificationService,
} from '../services/notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  @Sse('me')
  stream(): Observable<MessageEvent> {
    return interval(5000).pipe(
      map((i) => MOCK_NOTIFICATIONS[i % MOCK_NOTIFICATIONS.length]),
      map(
        (item): MessageEvent => ({
          type: 'system',
          data: JSON.stringify({ kind: 'notification:new', payload: item }),
        }),
      ),
    );
  }
}
