import { All, Controller, Post, Get, Body, Req, Res, HttpException, HttpStatus } from "@nestjs/common";
import { getAuth } from "./auth.config";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as nodemailer from "nodemailer";
import { SocksClient } from 'socks';
import * as net from 'net';
import * as dns from 'dns';

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
      return res.status(500).json({ error: "Failed to check email", details: error.message, stack: error.stack });
    }
  }

  @Get("debug-connectivity")
  async debugConnectivity(@Res() res: Response) {
    const report: any = {
      timestamp: new Date().toISOString(),
      env: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com (default)',
        smtpPort: process.env.SMTP_PORT || '587 (default)',
        smtpUser: process.env.SMTP_USER ? '(configured)' : '❌ MISSING',
        smtpPass: process.env.SMTP_PASS ? '(configured)' : '❌ MISSING',
        proxyHost: process.env.PROXY_HOST || '(not set)',
        proxyPort: process.env.PROXY_PORT || '(not set)',
        nodeEnv: process.env.NODE_ENV
      },
      tests: {}
    };

    // Test 1: DNS Resolution
    try {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      console.log(`🔍 [Debug] Resolving DNS for ${host}...`);
      const addresses = await new Promise((resolve, reject) => {
        dns.resolve(host, (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        });
      });
      report.tests.dns = { status: 'ok', host, addresses };
    } catch (e: any) {
      report.tests.dns = { status: 'failed', error: e.message };
    }

    // Test 2: TCP Connection to SMTP
    try {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 587;
      console.log(`🔍 [Debug] Testing TCP connection to ${host}:${port}...`);
      
      await new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(5000); // 5s timeout
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        socket.on('timeout', () => {
          socket.destroy();
          reject(new Error('Connection timed out'));
        });
        socket.on('error', (err) => {
          socket.destroy();
          reject(err);
        });
        socket.connect({ port, host });
      });
      report.tests.smtpTcp = { status: 'ok', message: 'Connected successfully' };
    } catch (e: any) {
      report.tests.smtpTcp = { status: 'failed', error: e.message };
    }

    // Test 3: Proxy Connection (if configured)
    if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
      try {
        const host = process.env.PROXY_HOST;
        const port = Number(process.env.PROXY_PORT);
        console.log(`🔍 [Debug] Testing Proxy connection to ${host}:${port}...`);

        await new Promise((resolve, reject) => {
          const socket = new net.Socket();
          socket.setTimeout(2000);
          socket.on('connect', () => {
            socket.destroy();
            resolve(true);
          });
          socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Proxy timed out'));
          });
          socket.on('error', (err) => {
            socket.destroy();
            reject(err);
          });
          socket.connect({ port, host });
        });
        report.tests.proxyTcp = { status: 'ok', message: 'Proxy reachable' };
      } catch (e: any) {
        report.tests.proxyTcp = { status: 'failed', error: e.message };
      }
    } else {
      report.tests.proxyTcp = { status: 'skipped', message: 'No proxy configured' };
    }

    // Test 4: SMTP Auth (Real Login)
    try {
      console.log(`🔍 [Debug] Testing SMTP Authentication...`);
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
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      };

      // If proxy is working, use it (similar logic to sendOtp)
      if (report.tests.proxyTcp && report.tests.proxyTcp.status === 'ok') {
          const proxyHost = process.env.PROXY_HOST;
          const proxyPort = process.env.PROXY_PORT;
          transporterConfig.getSocket = (options: any, callback: any) => {
            const socksOptions: any = {
                proxy: { host: proxyHost, port: Number(proxyPort), type: 5 },
                command: 'connect',
                destination: { host: options.host, port: options.port }
            };
            SocksClient.createConnection(socksOptions)
                .then(info => callback(null, { connection: info.socket }))
                .catch(err => callback(err));
          };
      }

      const transporter = nodemailer.createTransport(transporterConfig);
      await transporter.verify();
      report.tests.smtpAuth = { status: 'ok', message: 'SMTP Authentication Successful' };
    } catch (e: any) {
      report.tests.smtpAuth = { status: 'failed', error: e.message, code: e.code, response: e.response };
    }

    return res.json(report);
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

      let proxyHost = process.env.PROXY_HOST;
      let proxyPort = process.env.PROXY_PORT;

      if (proxyHost && proxyPort) {
        // Quick check if proxy is reachable
        const isProxyAvailable = await new Promise<boolean>((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(200); // 200ms timeout
            
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            
            socket.on('error', (err) => {
                socket.destroy();
                resolve(false);
            });
            
            try {
              socket.connect({ port: Number(proxyPort), host: proxyHost });
            } catch (e) {
              resolve(false);
            }
        });

        if (!isProxyAvailable) {
           console.warn(`⚠️ [SendOTP] Proxy configured at ${proxyHost}:${proxyPort} but not reachable. Falling back to direct connection.`);
           proxyHost = undefined;
           proxyPort = undefined;
        }
      }

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
      return res.status(500).json({ 
        error: "Failed to send verification code", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
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
