import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from 'pg';

@Injectable()
export class DbService {

  private pool: Pool
  constructor(
    private configService: ConfigService
  ) {
    this.pool = new Pool({
      host: this.configService.get<string>('host'),
      database: this.configService.get<string>('database'),
      user: this.configService.get<string>('user'),
      password: this.configService.get<string>('password'),
      port: 5432,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxLifetimeSeconds: 60
    })
  };
  dbPool() {
    return this.pool;
  }
};