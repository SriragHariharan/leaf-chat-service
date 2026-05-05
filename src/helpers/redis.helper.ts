import { createClient, RedisClientType } from 'redis';

class RedisHelper {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis');
        });

        this.client.connect().catch((err) => {
            console.error('Failed to connect to Redis:', err);
        });
    }

    // Store data in Redis
    async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    // Retrieve data from Redis
    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    // Delete a key from Redis
    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async sadd(key: string, value: string): Promise<number> {
        return await this.client.sAdd(key, value);
    }

    async srem(key: string, value: string): Promise<number> {
        return await this.client.sRem(key, value);
    }

    async sismember(key: string, member: string): Promise<boolean> {
        return await this.client.sIsMember(key, member);
    }


    // Close the Redis connection
    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export default new RedisHelper();