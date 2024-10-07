import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/authCrendentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { email, password, role } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async logIn(
    authCredentialsDto: AuthCredentialsDto,
    res: Response,
  ): Promise<void> {
    const { email, password } = authCredentialsDto;
    const query = this.userRepository.createQueryBuilder('user');
    const user = await query
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { userId: user.id, email };
      const accessToken: string = await this.jwtService.sign(payload);
      const accessTokenExpiryTime = 1000 * 60 * 60 * 1;
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + accessTokenExpiryTime),
        secure: process.env.NODE_ENV === 'production',
        signed: true,
      });
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async logOut(res: Response): Promise<void> {
    res.cookie('accessToken', 'logout', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
