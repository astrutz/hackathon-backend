import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest } from '../entities/login.interface';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../entities/register.interface';

@Controller('/auth')
export class PlayerController {
  constructor(private readonly authService: AuthService) {
  }

  @Post()
  async login(@Body() loginRequest: LoginRequest): Promise<string> {
    return await this.authService.loginUser(loginRequest);
  }

  @Post()
  async register(@Body() registerRequest: RegisterRequest): Promise<string> {
    return await this.authService.registerUser(registerRequest);
  }

}
