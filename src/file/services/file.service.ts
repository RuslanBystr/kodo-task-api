import { Injectable, NotFoundException } from '@nestjs/common';
import { FileEntity } from '../entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fs from 'fs';
import { UPLOAD_FILE_PATH } from '../../common/constants/file';
import { RemoveFileResponseDto } from '../dto/responses/remove-file-response.dto';
import { FileS3Service } from './file-s3.service';
import * as path from 'node:path';
import * as sharp from 'sharp';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileS3: FileS3Service,
  ) {}

  async saveFile(file: Express.Multer.File) {
    const originalPath = path.join(UPLOAD_FILE_PATH, file.filename);
    const avatarFileName = `avatar-${file.filename}.webp`;
    const avatarPath = path.join(UPLOAD_FILE_PATH, avatarFileName);

    try {
      await sharp(originalPath)
        .resize(48, 48)
        .toFormat('webp')
        .toFile(avatarPath);

      await this.fileS3.uploadFile(file.filename, originalPath);
      await this.fileS3.uploadFile(avatarFileName, avatarPath);

      const newFile = await this.fileRepository.save({
        fileName: file.filename,
      });
      await this.cleanupFiles(originalPath, avatarPath);

      return { uuid: newFile.uuid };
    } catch (err) {
      console.log(err);
    }
  }

  async cleanupFiles(originalPath: string, avatarPath: string) {
    try {
      if (fs.existsSync(originalPath)) {
        await fs.promises.unlink(originalPath);
      }
      if (fs.existsSync(avatarPath)) {
        await fs.promises.unlink(avatarPath);
      }
    } catch (err) {
      console.error('Error during file cleanup:', err);
    }
  }

  async getFile(uuid: string) {
    const file = await this.fileRepository.findOne({ where: { uuid } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const avatarFileName = `avatar-${file.fileName}.webp`;

    let existFile = await this.fileS3.downloadFile(avatarFileName);

    if (!existFile) {
      existFile = await this.fileS3.downloadFile(file.fileName);
    }

    return existFile;
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
