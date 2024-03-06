import * as f from './format'; // Assuming you have a module for formatting
import { CodeAndData, Codes } from '@/base/codes'; // Assuming you have a constants module

import { prisma } from '@/base/db';
import { Prisma, User } from '@prisma/client';
import { UserGroup } from '@/base/config';



export async function createUser(
  email: string, 
  username: string, 
  password: string, 
  group: UserGroup = UserGroup.User
): Promise<CodeAndData<User>> {
  if (!f.isValidEmail(email)) {
    return [Codes.ERR_INVALID_EMAIL, null];
  }
  if (!f.isValidUsername(username)) {
    return [Codes.ERR_INVALID_USERNAME, null];
  }
  if (!f.isValidPassword(password)) {
    return [Codes.ERR_INVALID_PASSWORD, null];
  }

  const pwHash = f.encodePassword(password);

  try {
    const result = await prisma.user.create({
      data: {
        email: email,
        username: username,
        pwHash: pwHash,
        group: group,
      },
    });
    return [Codes.DONE, result];
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return [Codes.ERR_EXISTENT_EMAIL, null];
    }
    throw error;
  }
}

export async function authUser(email: string, password: string): Promise<CodeAndData<User>> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && f.verifyPassword(password, user.pwHash)) {
    return [Codes.DONE, user];
  } else {
    return [Codes.ERR_WRONG_UNAME_OR_PW, null];
  }
}

export async function getUser(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}
