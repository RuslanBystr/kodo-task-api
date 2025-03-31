import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logger/services/logger.service';
import * as fs from 'node:fs';
import { Readable } from 'stream';
import { S3, Endpoint } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import { CONFIG } from '../../common/enums/config';

@Injectable()
export class FileS3Service {
  private s3: S3;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.bucketName = this.configService.get<string>(CONFIG.AWS_BUCKET_NAME);

    const options: S3.Types.ClientConfiguration = {
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      region: this.configService.get<string>(CONFIG.AWS_REGION),
      credentials: {
        accessKeyId: this.configService.get<string>(CONFIG.AWS_ACCESS_KEY_ID),
        secretAccessKey: this.configService.get<string>(
          CONFIG.AWS_SECRET_ACCESS_KEY,
        ),
      },
    };

    const endpointUrl = this.configService.get<string>(
      CONFIG.AWS_ENDPOINT_URL_S3,
    );
    if (endpointUrl) {
      options.endpoint = new Endpoint(endpointUrl);
    }

    this.s3 = new S3(options);
  }

  async uploadFile(
    fileName: string,
    filePath: string,
  ): Promise<ManagedUpload.SendData> {
    try {
      console.log('Checking file existence:', filePath);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const fileStream = fs.createReadStream(filePath);
      console.log('File stream created successfully');

      return await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: this.filterKey(fileName),
          Body: fileStream,
        })
        .promise();
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    const filteredKey = this.filterKey(key);

    const params = {
      Bucket: this.bucketName,
      Key: filteredKey,
    };

    try {
      const response = await this.s3.getObject(params).promise();
      return response.Body as Buffer;
    } catch (err) {
      await this.loggerService.error(err);
      throw err;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };
    return this.s3.getSignedUrlPromise('getObject', params);
  }

  getFileStream(key: string): Readable {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };
    return this.s3.getObject(params).createReadStream();
  }

  async removeFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (err) {
      await this.loggerService.error(err);
      throw err;
    }
  }

  private filterKey(key: string): string {
    return key.replace(/^[./]+|[./]+$/g, '');
  }
}
