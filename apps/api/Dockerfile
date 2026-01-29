FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copy app package files
COPY apps/api/package.json apps/api/
COPY apps/api/prisma ./apps/api/prisma/
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma Client
# Ensure we have the correct engines for alpine
# The prisma schema is located at apps/api/prisma/schema.prisma
RUN cd apps/api && npx prisma generate --schema=prisma/schema.prisma

# Build the server
RUN cd apps/api && pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm and openssl
RUN apk add --no-cache openssl && npm install -g pnpm

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules

# Copy app-specific files preserving structure
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Expose port
ENV PORT=3002
EXPOSE 3002

# Start the application
CMD ["node", "dist/main"]
