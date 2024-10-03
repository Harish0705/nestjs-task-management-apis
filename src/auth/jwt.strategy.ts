import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JWT_SECRET } from './auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@InjectRepository(User) private user: Repository<User>) {
    super({
      secretOrKey: JWT_SECRET,
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
    const user: User = await this.user.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
