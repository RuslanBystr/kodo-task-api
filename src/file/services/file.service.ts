import { Injectable, NotFoundException } from '@nestjs/common';
import { FileEntity } from '../entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fs from 'fs';
import { UPLOAD_FILE_PATH } from '../../common/constants/file';
import { RemoveFileResponseDto } from '../dto/responses/remove-file-response.dto';
import { FileS3Service } from './file-s3.service';
import * as path from 'node:path';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileS3: FileS3Service,
  ) {}

  async saveFile(file: Express.Multer.File) {
    const filePath = path.join(UPLOAD_FILE_PATH, file.filename);
    console.log(filePath);

    await this.fileS3.uploadFile(file.filename, filePath);

    const newFile = await this.fileRepository.save({ fileName: file.filename });

    return { uuid: newFile.uuid };
  }

  async getFile(uuid: string) {
    const file = await this.fileRepository.findOne({
      where: {
        uuid,
      },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    // return file.fileName;
    // get from S3
    return await this.fileS3.downloadFile(file.fileName);
  }

  async deleteFile(
    uuid: string,
    userId: number,
  ): Promise<RemoveFileResponseDto> {
    const file = await this.fileRepository.findOne({
      where: {
        uuid,
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!file) {
      return {
        message: 'File was not exist',
      };
    }
    const filePath = UPLOAD_FILE_PATH + '/' + file.fileName;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    //delete from S3
    await this.fileS3.removeFile(file.fileName);
    await this.fileRepository.delete({ uuid });
    return {
      message: 'File was successfully deleted',
    };
  }
}
