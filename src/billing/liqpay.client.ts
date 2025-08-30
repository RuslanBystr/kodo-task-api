import * as crypto from 'crypto';
import axios from 'axios';

export class LiqPayClient {
  constructor(
    private readonly publicKey: string,
    private readonly privateKey: string,
    private readonly apiUrl = 'https://www.liqpay.ua/api/3/checkout',
  ) {}

  private sign(data: string) {
    return crypto
      .createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64');
  }

  buildCheckoutPayload(payload: Record<string, unknown>) {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.sign(data);
    return { data, signature };
  }

  verifySignature(data: string, signature: string) {
    const expected = this.sign(data);
    return expected === signature;
  }

  async createCheckout(payload: Record<string, unknown>) {
    const body = this.buildCheckoutPayload(payload);

    const res = await axios.post(this.apiUrl, body);
    return res.data;
  }
}
