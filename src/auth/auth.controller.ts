import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/authCrendentials.dto';
import { Response } from 'express';
import { Roles } from './get-roles.decorator';
import { RolesGuard } from './auth.roles.guard';
import { UserRole } from './user-roles.enum';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.register(authCredentialsDto);
  }

  @Post('/login')
  async logIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logIn(authCredentialsDto, res);
    res.json({ message: 'cookie set' });
  }

  @Get('/logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logOut(res);
  }

  @Get('/users')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAll() {
    return this.authService.findAll();
  }
}
