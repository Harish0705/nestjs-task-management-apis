import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const { accessToken } = request.signedCookies;
          if (!accessToken) {
            return null;
          }
          return accessToken;
        },
      ]),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { userId } = payload;
    const user: User = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
