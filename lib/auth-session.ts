import type { Role } from "@prisma/client";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { getPrimaryRole, isStaff } from "@/lib/permissions";

type SessionAccount = {
  isActive: boolean;
  roles: Role[];
  securityVersion: number;
};
type AccountLookup = (id: string) => Promise<SessionAccount | null>;

export function canSignInAccount(account: {
  email: string;
  roles: Role[];
  isActive: boolean;
  phoneVerified: Date | null;
  invitedAt: Date | null;
}): boolean {
  const seededStaff =
    isStaff(account.roles) &&
    (account.email.endsWith("@aldera.tech") ||
      ["gading@gmail.com", "dery@gmail.com", "rafli@gmail.com"].includes(
        account.email
      ));
  return (
    account.isActive &&
    Boolean(account.phoneVerified || account.invitedAt || seededStaff)
  );
}

/** Node-side authorization refresh; middleware JWT checks are only an initial gate. */
export async function refreshSessionToken(
  token: JWT,
  lookup: AccountLookup = (id) =>
    prisma.user.findUnique({
      where: { id },
      select: { isActive: true, roles: true, securityVersion: true },
    })
): Promise<JWT | null> {
  const id = typeof token.id === "string" ? token.id : token.sub;
  if (!id) return null;
  try {
    const account = await lookup(id);
    if (!account?.isActive || account.roles.length === 0) return null;
    if ((token.securityVersion ?? 0) !== account.securityVersion) return null;
    return {
      ...token,
      id,
      roles: account.roles,
      role: getPrimaryRole(account.roles),
      securityVersion: account.securityVersion,
    };
  } catch {
    console.error("Session account verification failed; access denied.");
    return null;
  }
}
