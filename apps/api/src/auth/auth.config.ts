import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";

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
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  authInstance = betterAuth({
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (data: any) => {
        const { user, url } = data;
        // Redirect to frontend after verification
        // Use URL object to handle query parameters safely and avoid duplicates
        const urlObj = new URL(url);
        urlObj.searchParams.set("callbackURL", "http://localhost:3000");
        const verificationUrlWithRedirect = urlObj.toString();

        console.log("📧 ========================================");
        console.log(`Sending verification email to: ${user.email}`);
        console.log("Using SMTP configuration...");
        
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
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p><a href="${verificationUrlWithRedirect}">${verificationUrlWithRedirect}</a></p>
                <p>This link will expire in 24 hours.</p>
              </div>
            `,
          });
          console.log(`Email sent successfully! Message ID: ${info.messageId}`);
        } catch (error) {
          console.error("❌ Error sending email:", error);
          // Fallback log in case SMTP fails
          console.log(`Fallback - Verification URL: ${verificationUrlWithRedirect}`);
        }
        console.log("📧 ========================================");
      },
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],
  });

  return authInstance;
}
