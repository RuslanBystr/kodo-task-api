import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { diskStorage } from 'multer';

import { MAX_FILE_SIZE, UPLOAD_FILE_PATH } from '../../../common/constants';
import { JwtPayload } from '../../../common/types';
import { GetJwtPayload } from '../../../common/utils/decorators';
import { JwtAuthGuard } from '../../auth/guards';
import { DeleteFileApiDocs, UploadFileApiDocs } from '../docs';
import { FileService } from '../services/file.service';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly fileLocal: FileService) {}

  @UploadFileApiDocs()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_FILE_PATH || './uploads/public/',
        filename: (_, file, cb) => {
          cb(null, `${randomUUID()}-${file.originalname.replace(/\s/g, '-')}`);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @UploadedFile() // FOR ARRAY of files: Array<Express.Multer.File>)
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file received');
    }
    return await this.fileLocal.saveFile(file);
  }

  @Get('/:uuid')
  async getFile(@Param('uuid') uuid: string, @Res() res: Response) {
    if (!isUUID(uuid)) {
      throw new BadRequestException('Provide a valid UUID');
    }

    const file = await this.fileLocal.getFile(uuid);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (Buffer.isBuffer(file)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', file.length);

      return res.send(file);
    }
    console.warn('Error: File is not a Buffer', typeof file);
    return file ? res.sendFile(file, { root: UPLOAD_FILE_PATH }) : res.end();
  }

  @DeleteFileApiDocs()
  @Delete('/:uuid')
  @UseGuards(JwtAuthGuard)
  async deleteFile(
    @Param('uuid') uuid: string,
    @GetJwtPayload() { id: userId }: JwtPayload,
  ) {
    return await this.fileLocal.deleteFile(uuid, userId);
  }
}
