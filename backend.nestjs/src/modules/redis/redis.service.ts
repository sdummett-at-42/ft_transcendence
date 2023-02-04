import { Injectable } from '@nestjs/common';
import * as Redis from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
	private readonly client;

	constructor(private readonly config: ConfigService) {
		this.client = Redis.createClient({
			url: this.config.get('REDIS_URL'),
			legacyMode: true,
		});
		this.client.connect();
		this.client.on('error', (err) => {
			console.log('Redis error: ', err);
		});
		this.client.on('connect', () => {
			console.log('Redis connected');
		});
	}

	getClient() {
		return this.client;
	}
}
