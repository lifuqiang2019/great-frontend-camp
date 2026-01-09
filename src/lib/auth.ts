import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import nodemailer from "nodemailer";
import { SocksClient } from 'socks';

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
    sendVerificationEmail: async ({ user, url, token: _token }, _request) => {
      console.log("Attempting to send verification email...");
      const useProxy = process.env.USE_PROXY === 'true';
      const proxyHost = process.env.PROXY_HOST || '127.0.0.1';
      const proxyPort = parseInt(process.env.PROXY_PORT || '7890');
      
      console.log("SMTP Config Check:", {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        passExists: !!process.env.SMTP_PASS,
        port: process.env.SMTP_PORT,
        mode: useProxy ? `SOCKS5 Proxy via ${proxyHost}:${proxyPort}` : "Direct Connection"
      });

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "465"),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // 仅在启用代理时注入 socket 逻辑
        if (useProxy) {
          // @ts-expect-error: nodemailer types do not expose getSocket, but it is supported
          transporter.getSocket = function(options, callback) {
            console.log('🔗 Creating SOCKS5 connection to Gmail...');
           
            SocksClient.createConnection({
              proxy: {
                ipaddress: proxyHost, // 强制 IPv4
                port: proxyPort,
                type: 5
              },
              destination: {
                host: 'smtp.gmail.com',
                port: 465
              },
              command: 'connect',
              timeout: 10000 // 10秒超时
            }, (err, info) => {
              if (err) {
                console.error("❌ SOCKS5 Connection Failed:", err);
                return callback(err);
              }
              console.log('✅ SOCKS5 Connection Established!');
              if (info) {
                
                callback(null, info.socket);
              } else {
                callback(new Error("No socket info returned"));
              }
            });
          };
        }

        const info = await transporter.sendMail({
          from: '"Coding Community" <lfqiang2019@gmail.com>',
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
        console.log(`Verification email sent to ${user.email}. Message ID: ${info.messageId}`);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },
  socialProviders: {
     // Placeholder for WeChat if supported in future or via custom plugin
  }
});
