import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import nodemailer from "nodemailer";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: "Verify your email address",
        text: `Please verify your email by clicking the following link: ${url}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to Coding Community!</h2>
            <p>Please verify your email address to continue.</p>
            <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #cd853f; color: #fff; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>Or copy this link: ${url}</p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
     // Placeholder for WeChat if supported in future or via custom plugin
  }
});
