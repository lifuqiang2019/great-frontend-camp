import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let authInstance: any;

// Hack to prevent TypeScript from converting dynamic import to require
// This is necessary because the project is CommonJS but better-auth is ESM
const dynamicImport = new Function("specifier", "return import(specifier)");

export async function getAuth() {
  if (authInstance) return authInstance;

  const { betterAuth } = await dynamicImport("better-auth");
  const { prismaAdapter } = await dynamicImport("better-auth/adapters/prisma");

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],
  });

  return authInstance;
}
