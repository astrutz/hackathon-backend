import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest } from '../entities/login.interface';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../entities/register.interface';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('/login')
  async login(@Body() loginRequest: LoginRequest): Promise<{ jwt: string, id: number }> {
    return await this.authService.loginUser(loginRequest);
  }

  @Post('/register')
  async register(@Body() registerRequest: RegisterRequest): Promise<{ jwt: string, id: number }> {
    return await this.authService.registerUser(registerRequest);
  }

}
