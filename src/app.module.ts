import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Game } from './entities/game.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the config globally accessible
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'my_database'),
        entities: [Game], // Add Game entity here
        synchronize: true, // Don't use true in production!
      }),
    }),
    TypeOrmModule.forFeature([Game]), // Register Game in TypeOrmModule
  ],
  controllers: [AppController],
  providers: [GameService],
})
export class AppModule {}
