import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

// Try to set global proxy for Node.js fetch (used by better-auth)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { setGlobalDispatcher, ProxyAgent } = require("undici");
  if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
    const proxyUrl = `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
    const dispatcher = new ProxyAgent(proxyUrl);
    setGlobalDispatcher(dispatcher);
    console.log(`Global proxy set to ${proxyUrl}`);
  }
} catch (error) {
  console.warn("Failed to set global proxy with undici. If you are behind a proxy, GitHub login might fail.", error);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://admin.bigfedcamp.com",
    "https://www.bigfedcamp.com",
    "https://bigfedcamp.com",
    "http://bigfedcamp.com",
    "http://www.bigfedcamp.com",
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global Request Logger
  app.use((req: any, res: any, next: any) => {
    console.log(`🌐 [Global] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
}

void bootstrap();

