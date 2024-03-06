import { PrismaClient } from '@prisma/client';
import * as uuid from 'uuid';
import * as fs from 'fs';
import { promisify } from 'util';
import { UserGroup } from './config';
import { encodePassword } from '@/user/format';

export const prisma = new PrismaClient();

const writeFileAsync = promisify(fs.writeFile);

export async function createRootUser() {
  
  const rootUser = await prisma.user.findUnique({
    where: { email: '__root__' },
  });
  if (rootUser) {
    return;
  }

  // else create a new one
  const pw = uuid.v1();
  await prisma.user.create({
    data: {
      email: '__root__',
      username: 'root',
      pwHash: encodePassword(pw),
      pwUpdate: new Date(),
      group: UserGroup.Root,
    },
  });

  await writeFileAsync('./root_user_pwd.txt', pw);
}

export async function createGuestUser() {
  await prisma.user.upsert({
    where: { email: '__guest__' },
    update: {},
    create: {
      email: '__guest__',
      username: 'guest',
      pwHash: '',
      group: UserGroup.Guest,
    },
  });
}
