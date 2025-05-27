import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT') || '5432', 10),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: configService.get('NODE_ENV') === 'development' && configService.get('DB_SYNC') !== 'false',
  logging: configService.get('NODE_ENV') === 'development',  ssl: configService.get('NODE_ENV') === 'production' || configService.get('DB_SSL') === 'true' 
    ? { 
        rejectUnauthorized: false
      } 
    : false,
  migrationsRun: configService.get('NODE_ENV') === 'production',
});
