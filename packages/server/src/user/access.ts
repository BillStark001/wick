export enum UserGroup {
  Guest = 'guest',
  User = 'user',
  Host = 'host',
  Admin = 'admin',
  Root = 'root'
}

const groupPrecedence: readonly UserGroup[] = Object.freeze([
  UserGroup.Guest,
  UserGroup.User,
  UserGroup.Host,
  UserGroup.Admin,
  UserGroup.Root,
]);

function _group(g: UserGroup): UserGroup[] {
  if (!g || !groupPrecedence.includes(g)) {
    return [UserGroup.Root];
  }
  return groupPrecedence.slice(groupPrecedence.indexOf(g));
}

function _parseGroups(ret: string): UserGroup[] {
  const g_arr: UserGroup[] = JSON.parse(ret).slice(1);
  return g_arr.length === 0 ? [UserGroup.Guest] : g_arr;
}

// Token and Access should be represented as objects or classes
// TokenAccess.ts

export type TokenAccessType = { [name: string]: UserGroup[] | TokenAccessType }

export const TokenAccess: TokenAccessType = {
  Refresh: _group(UserGroup.User),
  Access: {
    General: _group(UserGroup.User),
    Meeting: {
      InitOrClose: _group(UserGroup.Host),
      Data: _group(UserGroup.User),
      Provide: _group(UserGroup.User),
      Consume: _group(UserGroup.Guest),
    },
    User: {
      Register: [UserGroup.Guest, UserGroup.Admin, UserGroup.Root],
      Login: [UserGroup.Guest],
      ChangeInfo: _group(UserGroup.User),
      ChangeCriticalInfo: _group(UserGroup.User),
    },
  },
};

// AccessControl.ts (continued)
function _genAccess(groupMap: Record<string, Set<UserGroup>>, prefix: string = ''): void {
  // This function needs to be adjusted to populate the groupMap with the correct tokens and access levels
  // You would need to recursively traverse the TokenAccess structure to populate the groupMap
}

const _groupMap: Record<string, Set<UserGroup>> = {};
_genAccess(_groupMap);

// AppConfig.ts (mock implementation)
export const AppConfig = {
  TokenAccessOverride: {
    // Define overrides here
  },
};

// AccessControl.ts (continued)
for (const [field, data] of Object.entries(AppConfig.TokenAccessOverride)) {
  _groupMap[field] = new Set(_parseGroups(data));
}

export function hasAccess(group: UserGroup, access: string): boolean {
  if (!_groupMap[access]) {
    return true;
  }
  return _groupMap[access].has(group);
}