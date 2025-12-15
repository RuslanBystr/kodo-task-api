export interface IMailPort {
  sendForgotPassword(payload: {
    email: string;
    name: string;
    code: string;
  }): Promise<void>;
  sendVerifyCode(payload: {
    email: string;
    name: string;
    code: string;
  }): Promise<void>;
}
