import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.email.split("@")[0], // Default name from email
        emailVerified: false,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsers, newUsersToday, activeSessions, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
          },
        },
      }),
      this.prisma.session.count({
        where: {
          expiresAt: {
            gt: now,
          },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          image: true,
        }
      })
    ]);

    return {
      totalUsers,
      newUsersToday,
      activeSessions,
      recentUsers,
    };
  }
}
