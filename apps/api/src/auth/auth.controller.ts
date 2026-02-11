import { All, Controller, Post, Body, Req, Res, HttpException, HttpStatus } from "@nestjs/common";
import { getAuth } from "./auth.config";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";
import { SocksClient } from 'socks';

// Hack to prevent TypeScript from converting dynamic import to require
const dynamicImport = new Function("specifier", "return import(specifier)");

const prisma = new PrismaClient();

@Controller("api/auth")
export class AuthController {
  
  @Post("check-email")
  async checkEmail(@Body() body: { email: string }, @Res() res: Response) {
    const { email } = body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      return res.status(200).json({ exists: !!user });
    } catch (error: any) {
      console.error("❌ [CheckEmail] Failed:", error);
      return res.status(500).json({ error: "Failed to check email", details: error.message });
    }
  }

  @Post("send-otp")
  async sendOtp(@Body() body: { email: string }, @Res() res: Response) {
    const { email } = body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`📨 [SendOTP] Requesting OTP for ${email}`);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      // 1. Save to DB
      await prisma.verificationCode.create({
        data: {
          email,
          code,
          expiresAt
        }
      });

      // 2. Configure Transporter (Reusing logic from auth.config.ts ideally, but simplified here)
      const smtpPort = Number(process.env.SMTP_PORT) || 587;
      const isSecure = smtpPort === 465;
      
      const transporterConfig: any = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true,
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 30000,
        socketTimeout: 30000
      };

      const proxyHost = process.env.PROXY_HOST;
      const proxyPort = process.env.PROXY_PORT;

      if (proxyHost && proxyPort) {
        console.log(`📧 [SendOTP] Configuring Proxy via SocksClient: ${proxyHost}:${proxyPort}`);
        
        transporterConfig.getSocket = (options: any, callback: any) => {
          console.log(`🔌 [SendOTP] establishing socks proxy connection to ${options.host}:${options.port}...`);
          const socksOptions: any = {
            proxy: {
              host: proxyHost,
              port: Number(proxyPort),
              type: 5 // SOCKS5
            },
            command: 'connect',
            destination: {
              host: options.host,
              port: options.port
            }
          };

          SocksClient.createConnection(socksOptions)
            .then((info) => {
              console.log(`✅ [SendOTP] Socks proxy connection established.`);
              
              // Monitor socket status to help debug VPN/Network issues
              info.socket.once('close', (hadError) => {
                 if (hadError) {
                    console.log(`⚠️ [SendOTP] Proxy socket closed with error. If this happens immediately during handshake, your VPN likely blocks SMTP ports (465/587).`);
                 }
              });

              callback(null, { connection: info.socket });
            })
            .catch((err) => {
              console.error(`❌ [SendOTP] Socks proxy connection failed:`, err);
              callback(err);
            });
        };
      } else {
        console.log(`⚠️ [SendOTP] No proxy configured (PROXY_HOST/PORT missing). Env: ${JSON.stringify(process.env.PROXY_HOST)}`);
      }

      const transporter = nodemailer.createTransport(transporterConfig);

      // 3. Send Email
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || '大前端同学营'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "【大前端同学营】注册验证码",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>注册验证码</h2>
            <p>您的验证码是：</p>
            <h1 style="color: #d97757; letter-spacing: 5px; background: #f5f5f5; padding: 10px; display: inline-block; border-radius: 5px;">${code}</h1>
            <p>该验证码将在 10 分钟后过期。</p>
            <p style="color: #999; font-size: 12px;">如果您没有请求此验证码，请忽略此邮件。</p>
          </div>
        `
      });

      console.log(`✅ [SendOTP] Code sent to ${email}`);
      return res.status(200).json({ success: true, message: "Verification code sent" });

    } catch (error: any) {
      console.error("❌ [SendOTP] Failed:", error);
      return res.status(500).json({ error: "Failed to send verification code", details: error.message });
    }
  }

  @All("*splat")
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    console.log(`📥 [AuthController] Request: ${req.method} ${req.url}`);
    
    try {
      const auth = await getAuth();
      const { toNodeHandler } = await dynamicImport("better-auth/node");
      return toNodeHandler(auth)(req, res);
    } catch (error) {
      console.error("❌ [AuthController] Error handling auth request:", error);
      res.status(500).json({ error: "Internal Server Error in Auth" });
    }
  }
}
