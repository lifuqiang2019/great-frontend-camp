import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { getAuth } from '../../auth/auth.config';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = await getAuth();
    
    // Check session using better-auth
    // We pass headers to let better-auth parse cookies/tokens
    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (!session || !session.user) {
      console.log("❌ [AdminGuard] No session found");
      throw new UnauthorizedException('Not authenticated');
    }

    // Check if user has admin role
    const user = session.user as any;
    console.log(`🔍 [AdminGuard] Checking user: ${user.email}, Role: ${user.role}`);
    
    if (user.role !== 'admin') {
      console.warn(`⛔ [AdminGuard] Access denied for user ${user.email} (Role: ${user.role})`);
      throw new UnauthorizedException('Access denied: Admins only');
    }

    // Attach user to request
    request.user = user;
    return true;
  }
}
