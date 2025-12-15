import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { LoggerService } from '../../../../infra/logger/services/logger.service';

@Catch()
export class ExceptionsLoggerFilter implements ExceptionFilter {
  constructor(private loggerService: LoggerService) {}
  private configureHttpExceptionResponse(exception: HttpException) {
    if (typeof exception.getResponse() === 'object')
      return { ...(exception.getResponse() as object) };
    else
      return {
        statusCode: exception.getStatus() || 500,
        message: exception.message,
      };
  }

  private configureErrorResponse(error: Error) {
    this.loggerService.error(error);
    return { statusCode: 500, message: 'Internal Server Error' };
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const responseJson =
      exception instanceof HttpException
        ? this.configureHttpExceptionResponse(exception)
        : this.configureErrorResponse(exception as Error);

    response.status(responseJson.statusCode || 500).json(responseJson);
  }
}
