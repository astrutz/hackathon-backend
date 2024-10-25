import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameService } from './services/game.service';
import { PlayerService } from './services/player.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Game } from './entities/game.entity';
import { Player } from './entities/player.entity';
import { PlayerController } from './controllers/player.controller';
import { GameController } from './controllers/game.controller';

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
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Game, Player],
        synchronize: true, // Don't use true in production!+
        ssl: { rejectUnauthorized: false }, // or `ssl: true` for basic SSL
      }),
    }),
    TypeOrmModule.forFeature([Game, Player]),
  ],
  controllers: [AppController, GameController, PlayerController],
  providers: [GameService, PlayerService],
})
export class AppModule {}
