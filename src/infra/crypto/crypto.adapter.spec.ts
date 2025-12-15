import { Test, TestingModule } from '@nestjs/testing';

import { CryptoAdapter } from './crypto.adapter';

describe('CryptoAdapter', () => {
  let service: CryptoAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoAdapter],
    }).compile();

    service = module.get<CryptoAdapter>(CryptoAdapter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
