import { Injectable } from '@nestjs/common';
import { CONFIG } from '../common/enums';
import { ConfigService } from '@nestjs/config';
import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';

@Injectable()
export class CryptoService {
  private kmsClient: KMSClient;
  private KMS_KEY_ID: string;

  constructor(private readonly configService: ConfigService) {
    this.kmsClient = new KMSClient({
      region: this.configService.get<string>(CONFIG.AWS_REGION),
      credentials: {
        accessKeyId: this.configService.get<string>(CONFIG.AWS_ACCESS_KEY_ID),
        secretAccessKey: this.configService.get<string>(
          CONFIG.AWS_SECRET_ACCESS_KEY,
        ),
      },
    });

    this.KMS_KEY_ID = this.configService.get<string>(CONFIG.AWS_KMS_KEY_ID);
  }

  async encryptMessage(message: string): Promise<string> {
    try {
      const command = new EncryptCommand({
        KeyId: this.KMS_KEY_ID,
        Plaintext: Buffer.from(message),
      });

      const response = await this.kmsClient.send(command);
      if (!response.CiphertextBlob) {
        throw new Error('Encryption failed: No CiphertextBlob returned');
      }
      return Buffer.from(response.CiphertextBlob).toString('base64');
    } catch (error) {
      console.error(error);
      return message;
    }
  }

  async decryptMessage(encryptedMessage: string): Promise<string> {
    try {
      const command = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedMessage, 'base64'),
      });

      const response = await this.kmsClient.send(command);
      if (!response.Plaintext) {
        throw new Error('Decryption failed: No Plaintext returned');
      }
      return new TextDecoder().decode(response.Plaintext);
    } catch (error) {
      console.error(error);
      return encryptedMessage;
    }
  }
}
