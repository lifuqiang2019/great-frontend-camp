import { Controller, Post, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Request } from 'express';
import { getAuth } from '../auth/auth.config';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  private async getUser(req: Request) {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    return session.user;
  }

  @Post(':questionId')
  async toggleFavorite(@Param('questionId') questionId: string, @Req() req: Request) {
    const user = await this.getUser(req);
    return this.favoritesService.toggleFavorite(user.id, questionId);
  }

  @Get(':questionId/check')
  async checkFavorite(@Param('questionId') questionId: string, @Req() req: Request) {
    const user = await this.getUser(req);
    return this.favoritesService.checkFavorite(user.id, questionId);
  }

  @Get()
  async getFavorites(@Req() req: Request) {
    const user = await this.getUser(req);
    return this.favoritesService.getFavorites(user.id);
  }
}
