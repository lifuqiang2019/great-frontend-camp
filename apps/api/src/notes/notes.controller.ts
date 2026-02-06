import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UnauthorizedException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Request } from 'express';
import { getAuth } from '../auth/auth.config';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

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

  @Get()
  async getNotes(@Req() req: Request) {
    const user = await this.getUser(req);
    return this.notesService.getUserNotes(user.id);
  }

  @Post()
  async createNote(@Req() req: Request, @Body() body: { content: string }) {
    const user = await this.getUser(req);
    return this.notesService.createNote(user.id, body.content);
  }

  @Patch(':id')
  async updateNote(
    @Req() req: Request, 
    @Param('id') id: string, 
    @Body() body: { content: string }
  ) {
    const user = await this.getUser(req);
    return this.notesService.updateNote(user.id, id, body.content);
  }

  @Delete(':id')
  async deleteNote(@Req() req: Request, @Param('id') id: string) {
    const user = await this.getUser(req);
    return this.notesService.deleteNote(user.id, id);
  }
}
