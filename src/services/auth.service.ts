import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from './player.service';
import { LoginRequest } from '../entities/login.interface';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from '../entities/register.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject()
    private playerService: PlayerService,
    private jwtService: JwtService,
  ) {
  }

  async loginUser(loginRequest: LoginRequest): Promise<string> {
    return this.playerService.findByName(loginRequest.name).then((player: Player) => {
      if (!player) {
        throw new NotFoundException('Kein Spieler gefunden mit Namen ' + loginRequest.name);
      }

      let validPassword: boolean = bcrypt.compareSync(loginRequest.password, player.password);
      if (!validPassword) {
        throw new BadRequestException('Passwort falsch');
      }

      return this.jwtService.signAsync({ sub: player.name });
    });
  }

  async registerUser(registerRequest: RegisterRequest): Promise<string> {
    if (await this.playerService.existPlayerByName(registerRequest.name.trim())) {
      throw new BadRequestException('Es existiert bereits ein Spieler mit diesem Namen');
    }

    if (!registerRequest.name || registerRequest.name.trim().length === 0) {
      throw new BadRequestException('Der Name darf nicht leer sein');
    }

    if (registerRequest.password !== registerRequest.confirmPassword) {
      throw new BadRequestException('Die Passwörter müssen übereinstimmen');
    }

    let hash = bcrypt.hashSync(registerRequest.password, 10);
    return await this.playerService.createPlayer(registerRequest.name, hash).then((player) => {
      return this.jwtService.signAsync({ sub: registerRequest.name });
    });
  }
}
