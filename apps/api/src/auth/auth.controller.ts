import { All, Controller, Req, Res } from "@nestjs/common";
import { auth } from "./auth.config";
import { toNodeHandler } from "better-auth/node";
import { Request, Response } from "express";

@Controller("api/auth")
export class AuthController {
  @All("*")
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth)(req, res);
  }
}
