import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async getConfig(key: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config ? config.value : null;
  }

  async getAllConfigs() {
    return this.prisma.systemConfig.findMany();
  }

  async getConfigs(keys: string[]) {
    return this.prisma.systemConfig.findMany({
      where: {
        key: { in: keys },
      },
    });
  }

  async setConfig(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
