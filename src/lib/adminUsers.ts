// Gestão de usuários do painel admin (AdminUser) com senha hasheada via bcryptjs.
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@/lib/adminAuth";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function findActiveAdminByEmail(email: string) {
  return prisma.adminUser.findFirst({
    where: { email: email.trim().toLowerCase(), active: true },
  });
}

export function isValidRole(value: unknown): value is AdminRole {
  return value === "SUPER_ADMIN" || value === "OPERADOR";
}
