import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logger/services/logger.service';
import * as fs from 'node:fs';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import {
  CompleteMultipartUploadCommandOutput,
  GetObjectCommand,
  S3,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
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

    const options: S3ClientConfig = {
      forcePathStyle: true,
      region: this.configService.get<string>(CONFIG.AWS_REGION),
      credentials: {
        accessKeyId: this.configService.get<string>(CONFIG.AWS_ACCESS_KEY_ID),
        secretAccessKey: this.configService.get<string>(CONFIG.AWS_SECRET_ACCESS_KEY),
      },
    };

    const endpointUrl = this.configService.get<string>(CONFIG.AWS_ENDPOINT_URL_S3);
    if (endpointUrl) {
      options.endpoint = endpointUrl;
    }

    this.s3 = new S3(options);
  }

  async uploadFile(
    fileName: string,
    filePath: string,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const fileStream = fs.createReadStream(filePath);

      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: this.filterKey(fileName),
          Body: fileStream,
        },
      });

      return await upload.done();
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  }
  async downloadFile(key: string): Promise<Buffer> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };

    try {
      const { Body } = await this.s3.getObject(params);
      if (Body instanceof Readable) {
        const chunks = [];
        for await (const chunk of Body) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      } else if (Body instanceof Uint8Array) {
        return Buffer.from(Body);
      } else {
        throw new Error('Unsupported Body type');
      }
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
    return getSignedUrl(this.s3, new GetObjectCommand(params), {
      expiresIn: 3600,
    });
  }

  async getFileStream(key: string): Promise<Readable> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };

    const response = await this.s3.getObject(params);

    if (response.Body instanceof Readable) {
      return response.Body;
    }

    throw new Error('Body is not a readable stream');
  }

  async removeFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: this.filterKey(key),
    };

    try {
      await this.s3.deleteObject(params);
    } catch (err) {
      await this.loggerService.error(err);
      throw err;
    }
  }

  private filterKey(key: string): string {
    return key.replace(/^[./]+|[./]+$/g, '');
  }
}
