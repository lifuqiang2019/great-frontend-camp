import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";
// import { SocksProxyAgent } from "socks-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";

const prisma = new PrismaClient();

let authInstance: any;

// Hack to prevent TypeScript from converting dynamic import to require
// This is necessary because the project is CommonJS but better-auth is ESM
const dynamicImport = new Function("specifier", "return import(specifier)");

export async function getAuth() {
  if (authInstance) return authInstance;

  const { betterAuth } = await dynamicImport("better-auth");
  const { prismaAdapter } = await dynamicImport("better-auth/adapters/prisma");

  // Create Nodemailer transporter
  const transporterConfig: any = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Add proxy support for local development (Gmail SMTP requires proxy in some regions)
  // Only use proxy if PROXY_HOST is explicitly defined in env (e.g. for local dev)
  // In production (Docker), we usually don't set PROXY_HOST, so it skips this.
  const proxyHost = process.env.PROXY_HOST;
  const proxyPort = process.env.PROXY_PORT;
  
  if (proxyHost && proxyPort) {
     // Switch to HTTP Proxy (HttpsProxyAgent) as it proved stable in diagnosis
     // and might be more robust in the NestJS environment than SocksProxyAgent
     const proxyUrl = `http://${proxyHost}:${proxyPort}`;
     console.log(`📧 Configuring SMTP Proxy (HTTP): ${proxyUrl}`);
     console.log(`   (Force Reload Check: ${new Date().toISOString()})`);
     
     try {
       transporterConfig.agent = new HttpsProxyAgent(proxyUrl);
       // Increase agent timeout
       transporterConfig.agent.timeout = 20000;
       console.log('   HTTP Proxy Agent attached.');
     } catch (e) {
       console.error('   ❌ Failed to create HttpsProxyAgent:', e);
     }
  }

  // Robust timeout settings
  transporterConfig.connectionTimeout = 20000; // 20 seconds
  transporterConfig.socketTimeout = 20000;
  
  // Ensure we use Port 465 (SSL) which was verified working
  transporterConfig.port = 465;
  transporterConfig.secure = true;
  
  // Allow self-signed certs if proxy intercepts
  transporterConfig.tls = {
    rejectUnauthorized: false
  };

  const transporter = nodemailer.createTransport(transporterConfig);

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (data: any) => {
        const { user, url } = data;
        // Redirect to frontend after verification
        const urlObj = new URL(url);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        urlObj.searchParams.set("callbackURL", frontendUrl);
        const verificationUrlWithRedirect = urlObj.toString();

        console.log("📧 ========================================");
        console.log(`Sending verification email to: ${user.email}`);
        
        try {
          const info = await transporter.sendMail({
            from: `"GreatFedCamp" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Verify your email address",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to GreatFedCamp!</h2>
                <p>Please click the button below to verify your email address:</p>
                <a href="${verificationUrlWithRedirect}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p style="font-size: 12px; color: #666;">If you didn't create an account, you can ignore this email.</p>
              </div>
            `,
          });
          console.log("Email sent: ", info.messageId);
        } catch (error) {
          console.error("Error sending email: ", error);
        }
        console.log("======================================== 📧");
      },
    },
  });

  return authInstance;
}
