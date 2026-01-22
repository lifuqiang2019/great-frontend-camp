import { All, Controller, Req, Res } from "@nestjs/common";
import { getAuth } from "./auth.config";
import { Request, Response } from "express";

// Hack to prevent TypeScript from converting dynamic import to require
const dynamicImport = new Function("specifier", "return import(specifier)");

@Controller("api/auth")
export class AuthController {
  @All(":*splat")
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const auth = await getAuth();
    const { toNodeHandler } = await dynamicImport("better-auth/node");
    return toNodeHandler(auth)(req, res);
  }
}
