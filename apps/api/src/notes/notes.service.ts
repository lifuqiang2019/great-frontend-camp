import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class NotesService {
  private readonly algorithm = 'aes-256-cbc';
  // Use a derived key from a secret. In production, ensure ENCRYPTION_KEY is set.
  // Using scrypt to derive a 32-byte key from the string.
  private readonly key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || 'default-secret-key-please-change-in-production', 
    'salt', 
    32
  );

  constructor(private prisma: PrismaService) {}

  private encrypt(text: string): { content: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { content: encrypted, iv: iv.toString('hex') };
  }

  private decrypt(encrypted: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async getUserNotes(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return notes.map(note => ({
      ...note,
      content: this.decrypt(note.content, note.iv),
    }));
  }

  async createNote(userId: string, content: string) {
    const { content: encryptedContent, iv } = this.encrypt(content);
    return this.prisma.note.create({
      data: {
        userId,
        content: encryptedContent,
        iv: iv,
      },
    });
  }

  async updateNote(userId: string, noteId: string, content: string) {
    const { content: encryptedContent, iv } = this.encrypt(content);
    return this.prisma.note.update({
      where: { id: noteId, userId },
      data: {
        content: encryptedContent,
        iv: iv,
      },
    });
  }

  async deleteNote(userId: string, noteId: string) {
    return this.prisma.note.delete({
      where: { id: noteId, userId },
    });
  }
}
