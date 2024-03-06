import { parseDuration } from '@/utils/time';
import duration from 'dayjs/plugin/duration';

// user group

export enum UserGroup {
  Guest = 'guest',
  User = 'user',
  Host = 'host',
  Admin = 'admin',
  Root = 'root'
}

export type UserGroupKeys = keyof typeof UserGroup;

const groupPrecedence = Object.freeze([
  UserGroup.Guest,
  UserGroup.User,
  UserGroup.Host,
  UserGroup.Admin,
  UserGroup.Root,
] as const);

export const minOf = (g: UserGroup): UserGroup[] => {
  if (!g || !groupPrecedence.includes(g)) {
    return [UserGroup.Root];
  }
  return groupPrecedence.slice(groupPrecedence.indexOf(g));
}

// user access

export type TokenAccessRecord = { [name: string]: UserGroup[] | TokenAccessRecord }
export type FlattenedTokenAccessRecord = Record<string, ReadonlySet<string>>;

export const flattenAccessRecord = (
  result: FlattenedTokenAccessRecord,
  accessRecord: TokenAccessRecord,
  prefix: string = ''
): FlattenedTokenAccessRecord => {
  for (const key in accessRecord) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(accessRecord[key])) {
      result[fullKey] = new Set(accessRecord[key] as UserGroup[]);
    } else {
      flattenAccessRecord(result, accessRecord[key] as TokenAccessRecord, fullKey);
    }
  }
  return result;
}

export const parseTokenAccess = (record: TokenAccessRecord) => {
  const flattenedTokenAccess = Object.freeze(flattenAccessRecord({}, record));

  const hasAccess = (group: string, access: string): boolean => {
    if (!flattenedTokenAccess[access]) {
      return true;
    }
    return flattenedTokenAccess[access].has(group);
  }
  return [flattenedTokenAccess, hasAccess] as [typeof flattenedTokenAccess, typeof hasAccess];
}

// app config

export type RawAppConfig = {
  JwtSecretKey: string;
  HmacSalt: string;

  AccessTokenExpires: string;
  RefreshTokenExpires: string;

  TokenAccess: TokenAccessRecord;
};

export type ParsedAppConfig = {
  JwtSecretKey: string;
  HmacSalt: Buffer;

  AccessTokenExpires: duration.Duration;
  RefreshTokenExpires: duration.Duration;

  TokenAccess: Readonly<FlattenedTokenAccessRecord>;
  hasAccess: (group: string, access: string) => boolean;
};

export const parseAppConfig = (raw: RawAppConfig) => {
  const {
    JwtSecretKey,
    HmacSalt,
    AccessTokenExpires,
    RefreshTokenExpires,
    TokenAccess: TokenAccessRaw
  } = raw;
  const [TokenAccess, hasAccess] = parseTokenAccess(TokenAccessRaw);
  const cfg: ParsedAppConfig = {
    JwtSecretKey,
    HmacSalt: Buffer.from(HmacSalt),
    AccessTokenExpires: parseDuration(AccessTokenExpires),
    RefreshTokenExpires: parseDuration(RefreshTokenExpires),
    TokenAccess,
    hasAccess,
  };
  return Object.freeze(cfg);
}
