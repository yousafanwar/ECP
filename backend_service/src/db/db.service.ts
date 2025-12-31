import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from 'pg';

@Injectable()
export class DbService {

  private pool: Pool
  constructor(
    private configService: ConfigService
  ) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
      database: this.configService.get<string>('database'),
      user: this.configService.get<string>('user'),
      password: this.configService.get<string>('password'),
      port: 5432,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      maxLifetimeSeconds: 60,
    })
  };

  async onModuleInit() {
    try{
      await this.pool.query('SELECT 1');
      console.log('Database connected successfully');
    } catch (err) {
      console.log('Database connection failed:', err);
    }
  };

  async onModuleDestroy() {
    await this.pool.end();
  };
  
  dbPool() {
    console.log('Database connected');
    return this.pool;
  }
};