import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  ApiConsumes,
  ApiPayloadTooLargeResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';

export const UploadFilesFeedbackApiDocs = ({
  fieldName = 'file',
  fileOptions,
}: {
  fieldName?: string;
  required?: boolean;
  fileOptions?: MulterOptions;
}) => {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, fileOptions)),
    ApiConsumes('multipart/form-data'),
    ApiPayloadTooLargeResponse({
      description: 'File too large',
      schema: {
        example: {
          statusCode: 413,
          message: 'File too large',
          error: 'Payload Too Large',
        },
      },
    }),
    ApiUnsupportedMediaTypeResponse({
      description: 'Unsupported file type ${fileType}',
      schema: {
        example: {
          statusCode: 415,
          message: 'Unsupported file type .mkv',
          error: 'Unsupported Media Type',
        },
      },
    }),
  );
};
