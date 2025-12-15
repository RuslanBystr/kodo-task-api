export interface ICryptoPort {
  encryptMessage(value: string): Promise<string>;
  decryptMessage(value: string): Promise<string>;
}
