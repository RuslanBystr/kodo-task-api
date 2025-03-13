// import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
// import {createClient } from "redis";
//
// @Injectable()
// export class RedisService implements OnModuleInit, OnModuleDestroy {
//     private client;
//
//     async onModuleInit() {
//         this.client = createClient();
//         this.client.on('error', (err) => { console.log('redis error:', err)});
//         await this.client.connect();
//     }
//
//     async setCache(key: string, value: any, ttl = 60) {
//         const stringValue = JSON.stringify(value);
//         await this.client.set(key, stringValue, { EX: ttl });
//     }
//
//     async getCache(key: string): Promise<any> {
//         const data = await this.client.get(key);
//         return data ? JSON.parse(data) : null;
//     }
//
//     async deleteCache(key: string): Promise<any> {
//         await this.client.del(key);
//     }
//     async onModuleDestroy() {
//         await this.client.quit();
//     }
// }
