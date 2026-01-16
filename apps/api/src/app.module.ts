import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health/health.controller";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { QuestionsModule } from "./questions/questions.module";
import { FavoritesModule } from "./favorites/favorites.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    QuestionsModule,
    FavoritesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
