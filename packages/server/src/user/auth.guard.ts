// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { JwtAuthService } from './jwt.service';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { ConfigService } from '@/config.service';
import { Request, Response } from 'express';
import { TimeService } from '@/time.service';
import { UserGroup } from '@/base/config';
import { Codes } from '@/base/codes';
import { getUser } from './opr';

export const TOKEN_TYPE_KEY = 'tokenType';
export const HARD_MODE_KEY = 'hardMode';
export const REFRESH_TOKEN_TYPE = 'Refresh';

export const SetTokenType = (tokenType?: string) => SetMetadata(TOKEN_TYPE_KEY, tokenType);
export const SetHardMode = (hard: boolean) => SetMetadata(HARD_MODE_KEY, hard);

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: JwtAuthService,
    private readonly configService: ConfigService,
    private readonly timeService: TimeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    const tokenType = this.reflector.get<string | undefined>(TOKEN_TYPE_KEY, context.getHandler());
    const hard = this.reflector.get<boolean>(HARD_MODE_KEY, context.getHandler()) ?? true;
    const isRefreshType = !tokenType || tokenType === REFRESH_TOKEN_TYPE;

    // get token
    let [user, rightType] = await this.getToken(request, tokenType); 
    let userRefresh: User | null;

    if ((!user || !rightType) && !isRefreshType) {

      // access token is needed but not found
      // try to get the refresh token first
      [userRefresh, rightType] = await this.getToken(request, REFRESH_TOKEN_TYPE);
      let flag = true;

      if (!userRefresh) {
        rightType = false;
        flag = false;
      } else if (!user || userRefresh.email != user.email) {
        // there is a refresh token for another user
        user = userRefresh;
      }

      if (flag && this.configService.config.hasAccess(user!.group, tokenType)) {
        // there is valid refresh token, grant a new access token if accessible
        const newAccessToken = this.authService.createJwtToken(
          user!, tokenType, 
          this.configService.config.AccessTokenExpires.asSeconds()
        );
        response.cookie(tokenType, newAccessToken, {
          expires: new Date(this.timeService.now + this.configService.config.AccessTokenExpires.asMilliseconds()),
          httpOnly: true,
        });
        rightType = true;
      } else {
        user = null;
      }
    }

    // 如果用户信息为空,并且是hard模式,返回错误
    if (!user && hard) {
      throw new UnauthorizedException(); 
    }

    const guestFlag = !!tokenType && this.configService.config.hasAccess(UserGroup.Guest, tokenType);
    if (!user && hard) {
      if (guestFlag)
        request.user = this.getGuestUser();
      response.json({ code: Codes.ERR_AUTH_FAILED });
      return false;
    }
    if (!rightType && hard) {
      if (guestFlag)
        request.user = this.getGuestUser();
        response.json({ code: Codes.ERR_WRONG_TOKEN_TYPE });
        return false;
    }

    request.user = user;

    return true;
  }

  private getToken(request: Request, tokenType?: string) {
    return this.authService.verifyJwtToken("", tokenType); // TODO
  }

  private getGuestUser() {
    return getUser('__guest__');
  }

}