import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { PlayerService } from './player.service';
import { LoginRequest } from '../entities/login.interface';
import { NotFoundError } from 'rxjs';
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

  async loginUser(loginRequest: LoginRequest): Promise<{ jwt: string, id: number }> {
    return this.playerService.findByName(loginRequest.name).then(async (player: Player) => {
      if (!player) {
        throw new NotFoundError('No Player found by name=' + loginRequest.name);
      }

      let validPassword: boolean = bcrypt.compareSync(loginRequest.password, player.password);
      if (!validPassword) {
        throw new BadRequestException('Password not valid');
      }

      let token = await this.jwtService.signAsync({ sub: player.name });
      return {
        jwt: token,
        id: player.id,
      };
    });
  }

  async registerUser(registerRequest: RegisterRequest): Promise<{ jwt: string, id: number }> {
    if (await this.playerService.existPlayerByName(registerRequest.name.trim())) {
      throw new BadRequestException('Player with this name exists already');
    }

    if (!registerRequest.name || registerRequest.name.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    if (registerRequest.password !== registerRequest.confirmPassword) {
      throw new BadRequestException('Password and ConfirmPassword are not equal');
    }

    let hash = bcrypt.hashSync(registerRequest.password, 10);

    return await this.playerService.createPlayer(registerRequest.name, hash).then(async (player) => {
      let token = await this.jwtService.signAsync({ sub: player.name });
      return {
        jwt: token,
        id: player.id,
      };
    });
  }
}
