import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let authInstance: any;

// Hack to prevent TypeScript from converting dynamic import to require
// This is necessary because the project is CommonJS but better-auth is ESM
const dynamicImport = new Function("specifier", "return import(specifier)");

export async function getAuth() {
  // if (authInstance) {
  //   console.log("🔄 [AuthConfig] Returning existing Better-Auth instance");
  //   return authInstance;
  // }
  
  console.log("✨ [AuthConfig] Initializing new Better-Auth instance...");

  const { betterAuth } = await dynamicImport("better-auth");
  const { prismaAdapter } = await dynamicImport("better-auth/adapters/prisma");
  
  const { APIError, createAuthMiddleware } = await dynamicImport("better-auth/api");

  // Configure Global Proxy for Fetch (Better-Auth uses fetch internally)
  if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
    try {
      const { setGlobalDispatcher, ProxyAgent } = await dynamicImport("undici");
      const proxyUrl = `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
      const dispatcher = new ProxyAgent(proxyUrl);
      setGlobalDispatcher(dispatcher);
      console.log(`🌐 Global Fetch Proxy Configured: ${proxyUrl}`);
    } catch (error) {
      console.warn("   ⚠️ Failed to configure global proxy with undici:", error);
    }
  }

  authInstance = betterAuth({
    appName: "BigFedCamp",
    logger: {
      level: "debug",
      disabled: false,
    },
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002/api/auth",
    session: {
      expiresIn: 60 * 60 * 24 * 3, // 3 days
      updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user: any) => {
             console.log("📝 [DB Hook] Creating user, setting emailVerified=true");
             return {
                 ...user,
                 emailVerified: true
             }
          },
          after: async (user: any) => {
            console.log(`✅ [DB Hook] User created: ${user.email}, ensuring emailVerified=true`);
            // Double check / Force update to ensure it's persisted
            if (!user.emailVerified) {
               await prisma.user.update({
                 where: { id: user.id },
                 data: { emailVerified: true }
               });
               console.log("   🔄 Force updated emailVerified to true");
            }
          }
        }
      },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx: any) => {
            if (ctx.path === "/sign-up/email") {
                console.log("🛑 [AuthHook] Intercepting SignUp...");
                const body = ctx.body as any;
                const email = body?.email;
                const otp = body?.otp; // We will send this from frontend

                if (!email) return;

                console.log(`   Checking OTP for ${email}: ${otp}`);

                if (!otp) {
                    throw new APIError("BAD_REQUEST", { message: "Verification code is required" });
                }

                // Verify OTP from DB
                const validCode = await prisma.verificationCode.findFirst({
                    where: {
                        email,
                        code: otp,
                        expiresAt: { gt: new Date() }
                    }
                });

                if (!validCode) {
                     throw new APIError("BAD_REQUEST", { message: "Invalid or expired verification code" });
                }

                // If valid, delete the code (consume it)
                await prisma.verificationCode.delete({ where: { id: validCode.id } });
                console.log("✅ OTP Verified! Proceeding with registration.");

                return {
                    context: {
                        ...ctx,
                        otpVerified: true
                    }
                };
            }
        }),
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false, 
    },
    plugins: [],
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    trustedOrigins: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://admin.bigfedcamp.com",
      "https://www.bigfedcamp.com",
      "https://bigfedcamp.com",
      "http://bigfedcamp.com",
      "http://www.bigfedcamp.com",
    ],
  });

  return authInstance;
}
