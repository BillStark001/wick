import { ParsedAppConfig, RawAppConfig, TokenAccessRecord, UserGroup, minOf, parseAppConfig } from "@/base/config";
import { Injectable } from "@nestjs/common";


const RawConfig: RawAppConfig = {
  JwtSecretKey: "114514",
  HmacSalt: "1919810",
  AccessTokenExpires: "5min",
  RefreshTokenExpires: "180d",
  TokenAccess: {
    Refresh: minOf(UserGroup.User),
    Access: {
      General: minOf(UserGroup.User),
      Meeting: {
        InitOrClose: minOf(UserGroup.Host),
        Data: minOf(UserGroup.User),
        Provide: minOf(UserGroup.User),
        Consume: minOf(UserGroup.Guest),
      },
      User: {
        Register: [UserGroup.Guest, UserGroup.Admin, UserGroup.Root],
        Login: [UserGroup.Guest],
        ChangeInfo: minOf(UserGroup.User),
        ChangeCriticalInfo: minOf(UserGroup.User),
      },
    },
  }
};

export const AppConfig = parseAppConfig(RawConfig);

@Injectable()
export class ConfigService {
  constructor(
    private appConfig: ParsedAppConfig,
  ) { }

  get config() {
    return this.appConfig;
  }
}