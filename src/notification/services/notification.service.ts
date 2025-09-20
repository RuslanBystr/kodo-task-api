import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  severity?: 'info' | 'warning' | 'critical';
  createdAt: string;
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'b4e9f7d0-1',
    title: 'Subscription renews in 7 days',
    body: 'Your current period ends on 2025-09-24. Renew to avoid interruption.',
    severity: 'warning',
    createdAt: '2025-09-17T11:05:00.000Z',
  },
  {
    id: 'b4e9f7d0-2',
    title: 'Payment failed',
    body: 'We could not process your last invoice. Please update your payment method.',
    severity: 'critical',
    createdAt: '2025-09-16T18:42:00.000Z',
  },
  {
    id: 'b4e9f7d0-3',
    title: 'Welcome to KodoTask',
    body: 'You’re all set. Explore the Copilot and Notifications.',
    severity: 'info',
    createdAt: '2025-09-15T08:15:30.000Z',
  },
];

@Injectable()
export class NotificationService {
  private readonly stream$ = new Subject<MessageEvent>();

  sse(): Observable<MessageEvent> {
    return this.stream$.asObservable();
  }

  createAndPush(item: NotificationItem): NotificationItem {
    this.stream$.next({
      type: 'system',
      data: JSON.stringify({ kind: 'notification:new', payload: item }),
    });
    return item;
  }
}
