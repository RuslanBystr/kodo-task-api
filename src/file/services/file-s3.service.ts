import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logger/services/logger.service';
import fs from 'fs';
import { Readable } from 'stream';
import { config, Endpoint, S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import SendData = ManagedUpload.SendData;

@Injectable()
export class FileS3Service {
  private s3: S3;
  public bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.bucketName = this.configService.get('AWS_BUCKET_NAME');

    const options: S3.Types.ClientConfiguration = {};
    if (this.configService.get('AWS_ENDPOINT_URL_S3')) {
      options.endpoint = new Endpoint(
        this.configService.get('AWS_ENDPOINT_URL_S3'),
      );
      config.update({ s3ForcePathStyle: true });
    }
    this.s3 = new S3(options);
  }

  async uploadFile(fileName: string, filePath: string): Promise<SendData> {
    const fileStream = fs.createReadStream(filePath);
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(fileName),
      Body: fileStream,
    };
    try {
      return await this.s3.upload(params).promise();
    } catch (error) {
      await this.loggerService.error(error);
      throw error;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };
    try {
      const response = await this.s3.getObject(params).promise();
      return response.Body as Buffer;
    } catch (error) {
      await this.loggerService.error(error);
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };
    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async getFileStream(key: string): Promise<Readable> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };
    const response = await this.s3.getObject(params).createReadStream();
    return response;
  }

  async removeFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      await this.loggerService.error(error);
      throw error;
    }
  }

  filterKey(key: string) {
    return key.replace(/^[./]+|[./]+$/g, '');
  }
}
