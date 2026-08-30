
import { PrismaClient } from '@prisma/client';

declare global {
  // `var` is required here: `let` and `const` are block-scoped and cannot
  // augment `globalThis`, which is the entire purpose of this declaration. It is
  // the documented Prisma singleton pattern — without it, every hot reload in
  // development opens another connection pool until Postgres refuses new ones.
  //
  // The disable comment has to sit immediately above the line it covers;
  // `eslint-disable-next-line` means the NEXT line, not the next statement.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
