FROM node:20-alpine AS builder

# Install pnpm
RUN apk add --no-cache openssl && npm install -g pnpm

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copy app package files
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN cd apps/api && npx prisma generate

# Build the server
RUN pnpm run build --filter @greatfedcamp/api

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Expose port
ENV PORT=3002
EXPOSE 3002

# Start the application
CMD ["node", "apps/api/dist/main"]
