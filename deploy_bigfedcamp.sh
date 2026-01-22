#!/bin/bash
set -e

# ==========================================
# BigFedCamp 部署脚本
# ==========================================

# 检查环境变量
# 必须在运行脚本前设置这些变量，例如：
# export SERVER_IMAGE=...
# export CLIENT_IMAGE=...
# export DATABASE_URL=...
# export BETTER_AUTH_SECRET=...

[ -z "$SERVER_IMAGE" ] && echo "Err: SERVER_IMAGE missing" && exit 1
[ -z "$CLIENT_IMAGE" ] && echo "Err: CLIENT_IMAGE missing" && exit 1
[ -z "$DATABASE_URL" ] && echo "Err: DATABASE_URL missing (Required for MongoDB connection)" && exit 1

# 如果 BETTER_AUTH_SECRET 未设置，则自动生成一个
if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "Warn: BETTER_AUTH_SECRET missing. Generating a random secret..."
    BETTER_AUTH_SECRET=$(openssl rand -hex 16)
    echo "Generated BETTER_AUTH_SECRET: $BETTER_AUTH_SECRET"
fi

echo "Starting deployment..."
echo "Server Image: $SERVER_IMAGE"
echo "Client Image: $CLIENT_IMAGE"

# 检查/安装 Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
fi

# 创建网络 (用于容器间通信)
docker network create bigfedcamp-net || true

# ==========================================
# 1. 部署 Server (API) - Port 3002
# ==========================================
echo "Deploying Server..."
docker pull $SERVER_IMAGE
docker stop bigfedcamp-server || true
docker rm bigfedcamp-server || true

docker run -d --name bigfedcamp-server \
  --restart always \
  --network bigfedcamp-net \
  -p 3002:3002 \
  -e PORT=3002 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  -e BETTER_AUTH_URL="https://api.bigfedcamp.com/api/auth" \
  -e FRONTEND_URL="https://www.bigfedcamp.com" \
  $SERVER_IMAGE

# ==========================================
# 2. 部署 Client (Web) - Port 3001
# ==========================================
echo "Deploying Client..."
docker pull $CLIENT_IMAGE
docker stop bigfedcamp-web || true
docker rm bigfedcamp-web || true

docker run -d --name bigfedcamp-web \
  --restart always \
  --network bigfedcamp-net \
  -p 3001:3001 \
  -e PORT=3001 \
  -e NEXT_PUBLIC_API_URL="https://api.bigfedcamp.com" \
  $CLIENT_IMAGE

# ==========================================
# 3. 清理
# ==========================================
docker image prune -f
echo "Deployment Success!"
echo "API (bigfedcamp-server) is running on port 3002"
echo "Web (bigfedcamp-web) is running on port 3001"
