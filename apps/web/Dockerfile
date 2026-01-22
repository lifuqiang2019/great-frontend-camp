FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm

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

# Set env vars for build
ENV NEXT_PUBLIC_API_URL=https://api.bigfedcamp.com
ENV BETTER_AUTH_SECRET=build_time_dummy_secret

# Build the client
RUN cd apps/web && pnpm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

WORKDIR /app/apps/web

# Set port
ENV PORT=3001
EXPOSE 3001

# Start the application
CMD ["pnpm", "start"]
