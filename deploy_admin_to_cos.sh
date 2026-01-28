#!/bin/bash
set -e

# ==========================================
# Admin 项目构建与部署到腾讯云 COS 脚本
# 适用于 CI/CD 环境 (如 CNB, 云效, Jenkins 等)
# ==========================================

# 1. 环境准备与依赖安装
echo "Step 1: Preparing environment..."
npm install -g pnpm
pnpm config set registry https://registry.npmmirror.com

# 2. 智能安装依赖
echo "Step 2: Installing dependencies..."
# 先尝试普通安装（利用缓存）
pnpm install

# 3. 构建项目 (带自愈逻辑)
echo "Step 3: Building Admin project..."
export VITE_API_URL=https://api.bigfedcamp.com

# 尝试首次构建
if ! pnpm --filter @greatfedcamp/admin build; then
    echo "Build failed! Suspecting platform-specific binary issue."
    echo "Starting self-healing process..."
    
    # 清理所有可能的缓存干扰
    echo "Cleaning node_modules and lock files..."
    rm -rf node_modules pnpm-lock.yaml
    rm -rf apps/admin/node_modules
    
    # 重新安装（在当前环境下生成全新的依赖树）
    echo "Reinstalling dependencies..."
    pnpm install
    
    # 再次尝试构建
    echo "Retrying build..."
    if ! pnpm --filter @greatfedcamp/admin build; then
        echo "Fatal: Build failed even after clean reinstall."
        exit 1
    fi
fi

# 4. 准备 COS 上传环境
echo "Step 4: Preparing COS upload environment..."
mkdir -p /tmp/cos-upload
if [ ! -d "/tmp/cos-upload/node_modules" ]; then
    npm install --prefix /tmp/cos-upload cos-nodejs-sdk-v5
fi

# 5. 执行上传
echo "Step 5: Uploading to COS..."
export NODE_PATH=/tmp/cos-upload/node_modules

# 运行 Node.js 上传脚本
node -e '
const COS = require("cos-nodejs-sdk-v5");
const fs = require("fs");
const path = require("path");

const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const secretId = process.env.COS_SECRET_ID;
const secretKey = process.env.COS_SECRET_KEY;

if (!bucket || !region || !secretId || !secretKey) {
  console.error("Error: Missing COS environment variables (COS_BUCKET, COS_REGION, COS_SECRET_ID, COS_SECRET_KEY).");
  process.exit(1);
}

const cos = new COS({
  SecretId: secretId,
  SecretKey: secretKey
});

const distDir = path.resolve("apps/admin/dist");

function uploadDir(dir, prefix = "") {
  if (!fs.existsSync(dir)) {
     console.error("Error: Dist directory not found at " + dir);
     process.exit(1);
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const key = path.posix.join(prefix, file);

    if (stat.isDirectory()) {
      uploadDir(filePath, key);
    } else {
      // 设置缓存策略
      let cacheControl = "public, max-age=31536000, immutable";
      if (file === "index.html") {
        cacheControl = "no-cache";
      }

      console.log(`Uploading ${key}...`);
      cos.putObject({
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: fs.createReadStream(filePath),
        Headers: {
          "Cache-Control": cacheControl
        }
      }, (err, data) => {
        if (err) {
          console.error(`Failed to upload ${key}:`, err);
          process.exit(1);
        } else {
          console.log(`Success: ${key}`);
        }
      });
    }
  });
}

uploadDir(distDir);
'
