// jwt.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client'; // 引入Prism
import { ConfigService } from '@/config.service';
import { getUser } from './opr';

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  createJwtToken(user: User, tokenType: string, expiresDelta?: number): string {
    const payload = {
      sub: user.email,
      name: user.username,
      type: tokenType,
    };

    const expiresIn = expiresDelta
      ? expiresDelta
      : this.configService.config.AccessTokenExpires.asSeconds();

    return this.jwtService.sign(payload, {
      secret: this.configService.config.JwtSecretKey,
      expiresIn,
    });
  }

  async verifyJwtToken(token: string, tokenType?: string): Promise<[User | null, boolean]> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.config.JwtSecretKey,
      });

      if (tokenType && tokenType !== payload.type) {
        return [null, false];
      }

      const user = await this.getUserByEmail(payload.sub);

      if (!user || user.pwUpdate.getTime() > new Date(payload.iat * 1000).getTime()) {
        return [user, false];
      }

      return [user, true];
    } catch (error) {
      return [null, false];
    }
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    return await getUser(email);
  }
}