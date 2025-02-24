import { Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsLoggerFilter } from './error.filter';

export const errorFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: ExceptionsLoggerFilter,
};
