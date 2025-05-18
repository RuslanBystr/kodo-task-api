import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileService } from '../services/file.service';
import { randomUUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE, UPLOAD_FILE_PATH } from '../../common/constants/file';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetJwtPayload } from '../../utils/decorators/jwt-payload.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { UploadFileApiDocs } from '../docs/upload-file.decorator';
import { DeleteFileApiDocs } from '../docs/delete-file.decorator';
import { isUUID } from 'class-validator';

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
    console.log('Received file:', file);
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

    if (!(file instanceof Buffer)) {
      console.error('Error: File is not a Buffer', typeof file);
      throw new InternalServerErrorException('File format error');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', file.length);

    return res.send(file);
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
