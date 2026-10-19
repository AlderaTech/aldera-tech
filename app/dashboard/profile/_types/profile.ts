import type { User } from "@prisma/client";

export type ProfileUser = Pick<
  User,
  "id" | "name" | "email" | "roles" | "avatar" | "phone" | "createdAt"
>;
export type ProfileValues = Pick<ProfileUser, "name"> & { phone: string };
