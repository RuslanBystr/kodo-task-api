import 'express';

export declare module 'express' {
  interface Request {
    user: {
      id: number;
      role: string;
      email: string;
    };
  }
}
