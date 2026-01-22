const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'nicequestions');

// 知识库：包含面试官提问、高分逐字稿、以及硬核技术补充（代码/深度解析）
const knowledgeBase = {
  1: {
    title: "SSR、CSR、SSG、ISR 深度解析",
    content: `
## 面试官提问

"我看你简历里写了精通 Next.js，那你能不能跟我讲讲，SSR、SSG 和 CSR 到底有什么区别？在实际业务里，你会怎么根据场景来做选型？"

## 面试高分回答 (逐字稿)

"面试官你好。关于渲染模式，我在项目中有过深入的实践。

简单来说，**CSR (客户端渲染)** 是目前 SPA 的主流，适合后台管理系统，体验好但 SEO 差，首屏慢。

为了解决 SEO 和首屏白屏，我们会用 **SSR (服务端渲染)**，比如 Next.js，它在服务端生成 HTML，用户能更快看到内容，但对服务器压力大。

如果内容不怎么变，比如博客或文档，我会首选 **SSG (静态生成)**，构建时直接生成 HTML，配合 CDN 速度极快。

而 **ISR (增量静态再生)** 是 SSG 的升级版，它允许我们在不重新构建整个项目的情况下，通过配置 revalidate 时间来更新部分页面，是目前我在做内容型网站时的首选方案，平衡了性能和时效性。

在具体实现上，SSR 虽然首屏快，但浏览器展示后还需要下载 JS 进行 **Hydration (注水)** 才能响应交互，所以要特别注意控制 JS 体积，避免出现‘看得到点不动’的情况。"

## 硬核补充：代码与深度解析

### 1. Next.js 中的实现差异

\`\`\`typescript
// 1. SSR (Server-Side Rendering)
// 每次请求都会执行，适合实时性强的数据
export async function getServerSideProps(context) {
  const res = await fetch(\`https://api.example.com/data\`);
  const data = await res.json();
  return { props: { data } };
}

// 2. SSG (Static Site Generation)
// 构建时执行一次，适合博客、文档
export async function getStaticProps() {
  const res = await fetch(\`https://api.example.com/posts\`);
  const posts = await res.json();
  return { props: { posts } };
}

// 3. ISR (Incremental Static Regeneration)
// 构建时生成，但每隔 10秒 允许重新生成一次
export async function getStaticProps() {
  const res = await fetch(\`https://api.example.com/products\`);
  const products = await res.json();
  
  return { 
    props: { products },
    revalidate: 10, // 关键配置：ISR
  };
}
\`\`\`
`
  },
  2: {
    title: "前端依赖治理与供应链安全",
    content: `
## 面试官提问

"现在的项目依赖越来越多，你是怎么管理这些第三方包的？有没有遇到过依赖冲突、版本不一致或者安全漏洞这类问题？"

## 面试高分回答 (逐字稿)

"在我的项目中，依赖治理是工程化的重要一环。我认为不仅仅是 npm install 那么简单。

首先，我强制要求团队提交 **Lock 文件** (package-lock.json 或 pnpm-lock.yaml)，确保大家开发环境一致，避免‘我这也行你那不行’的问题。同时我会配置 **.npmrc** 文件，开启 \`save-exact=true\`，默认锁定依赖的精确版本。

其次，我非常关注 **幽灵依赖** 问题，所以我大力推行 **pnpm**。它的软链机制能确保我们只能访问 package.json 里声明过的包，从根源上解决了依赖结构混乱的问题。

最后是安全，我会在 CI/CD 流程中加入 **npm audit**，如果发现高危漏洞，直接阻断构建。对于不再使用的依赖，我会定期用 **depcheck** 工具进行清理，保持项目的纯净。"

## 硬核补充：代码与深度解析

### 1. 关键配置文件 .npmrc

\`\`\`ini
# .npmrc
# 默认保存精确版本，不再使用 ^ 或 ~
save-exact=true

# 提升安装速度，使用淘宝源 (可选)
registry=https://registry.npmmirror.com/
\`\`\`

### 2. CI/CD 安全检查脚本 (package.json)

\`\`\`json
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "clean:deps": "depcheck",
    "prebuild": "npm run audit" 
  }
}
\`\`\`
`
  },
  3: {
    title: "构建可维护代码体系：从规范到架构",
    content: `
## 面试官提问

"我们团队比较看重代码质量。你觉得什么样的代码才算‘可维护’？平时你在项目中会通过哪些手段来保证代码的可维护性？"

## 面试高分回答 (逐字稿)

"我认为代码的可维护性是衡量高级工程师的重要标准。在我的经验里，可维护性主要靠三点：

第一是 **类型约束**。我会全面使用 **TypeScript**，因为‘类型即文档’。定义好 Interface，后来的人接手时，不需要猜这个参数是什么，IDE 会直接告诉他。

第二是 **代码规范与自动化**。我会配置 ESLint、Prettier 和 Husky，在 Git Commit 时自动检查，把低级错误挡在仓库门外。

第三是 **架构分层**。在 React 组件中，我坚持 **UI 与逻辑分离**。把数据请求抽离成 Custom Hooks，UI 组件只负责渲染纯展示。同时我会提倡使用 **纯函数 (Pure Function)**，保证输入确定输出就确定，这样逻辑清晰，也方便写单元测试。"

## 硬核补充：代码与深度解析

### 1. UI 与逻辑分离 (Custom Hooks)

\`\`\`typescript
// useUser.ts (逻辑层)
export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return { user };
};

// UserProfile.tsx (UI 层 - 纯展示)
const UserProfile = ({ userId }: { userId: string }) => {
  const { user } = useUser(userId); // 逻辑抽离

  if (!user) return <Skeleton />;
  return <div>{user.name}</div>;
};
\`\`\`

### 2. 纯函数示例

\`\`\`typescript
// Bad: 依赖外部状态，难以测试
let taxRate = 0.1;
const calculateTotal = (price: number) => price * (1 + taxRate);

// Good: 纯函数，输入决定输出
const calculateTotalPure = (price: number, rate: number) => price * (1 + rate);
\`\`\`
`
  },
  4: {
    title: "极致性能优化：全链路加载慢诊断与解决",
    content: `
## 面试官提问

"如果用户反馈页面加载很慢，你会怎么去排查？有什么具体的思路或者工具吗？不要只说‘压缩图片’这种点，我想听听你的系统性思路。"

## 面试高分回答 (逐字稿)

"遇到页面加载慢，我不会上来就瞎优化。我的习惯是**先诊断，后治理**。

首先，我会用 **Chrome DevTools 的 Performance 面板** 或者 **Lighthouse** 跑一下分，看看到底慢在哪里。是 TTFB 慢（后端问题），还是资源下载慢（网络问题），还是 JS 执行慢（长任务阻塞）。

如果是网络慢，我会上 CDN、开启 HTTP/2、做 Brotli 压缩。

如果是资源大，我会做路由懒加载 (Code Splitting)，把非首屏的 JS 拆出去；图片转 WebP。

如果是渲染卡，我会看是不是有 Long Task 阻塞了主线程，考虑用 Web Worker 或者 React 的并发模式来优化。

此外，我还会建立性能监控体系，利用 **PerformanceObserver** 收集线上的 Web Vitals 指标，持续跟踪优化效果。"

## 硬核补充：代码与深度解析

### 1. Performance API 诊断

\`\`\`javascript
// 计算 TTFB (Time to First Byte)
const navEntry = performance.getEntriesByType('navigation')[0];
console.log('TTFB:', navEntry.responseStart - navEntry.requestStart);

// 计算 DOMContentLoaded 时间
console.log('DCL:', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
\`\`\`

### 2. React 路由懒加载

\`\`\`typescript
import React, { Suspense } from 'react';

// 懒加载组件
const HeavyChart = React.lazy(() => import('./HeavyChart'));

function App() {
  return (
    // Suspense 提供加载时的占位符
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
\`\`\`
`
  },
  5: {
    title: "技术选型决策方法论：ROI 与 风险控制",
    content: `
## 面试官提问

"作为技术负责人，当团队要引入一个新技术或者新框架时，你的决策依据是什么？怎么确保引入这个技术不会给项目带来风险？"

## 面试高分回答 (逐字稿)

"作为技术负责人，我在做技术选型时，最看重的是 **ROI (投入产出比)** 和 **风险控制**，而不是技术本身够不够新。

首先我会问：引入这个技术解决了什么核心痛点？比如我们从 Vue2 升 Vue3，是为了解决大型项目中类型支持差和逻辑复用难的问题。

其次是成本分析。团队的学习成本高吗？现有的基础设施支持吗？

最后是风险兜底。这个开源库的社区活跃度如何？如果它不维护了，我们能兜得住吗？

通常我会先做一个 **PoC (概念验证)** 小样，验证通过后，再采用**渐进式迁移**的策略，逐步替换，绝不搞‘大爆炸’式的重构。"

## 硬核补充：代码与深度解析

### 1. PoC (Proof of Concept) 验证清单

在进行 PoC 时，我会创建一个简单的仓库，重点验证以下几点：

1.  **构建流程打通**：能不能跑通现有的 Webpack/Vite 流程？
2.  **核心功能覆盖**：能不能实现业务最复杂的场景？
3.  **兼容性测试**：是否支持现有的浏览器要求？

### 2. 渐进式迁移策略 (Strangler Fig Pattern)

\`\`\`nginx
# Nginx 配置示例：将新路由转发到新应用，旧路由保留
location /new-feature {
    proxy_pass http://new-tech-stack-app;
}

location / {
    proxy_pass http://legacy-app;
}
\`\`\`
`
  },
  6: {
    title: "TypeScript 优势及应用",
    content: `
## 面试官提问

"我看你项目里都在用 TypeScript。你觉得它给项目带来的最大价值是什么？仅仅是多了个类型检查吗？"

## 面试高分回答 (逐字稿)

"我现在做项目，如果没有 TypeScript 我是不敢写的。

对我来说，TS 最大的优势不是‘类型检查’，而是**‘重构的信心’**和**‘开发体验’**。

在大型项目中，改一个底层接口，JS 里可能要全局搜半天，还容易漏改。但在 TS 里，改完定义，所有报错的地方就是需要修改的地方，这种安全感是无价的。

另外，TS 的**泛型**和**工具类型**非常强大。比如我会常用 \`Pick\`、\`Partial\`、\`Omit\` 这些内置工具类型来转换接口，或者封装一个通用的请求函数，通过泛型传入返回值的结构，用起来的时候能自动推导，非常丝滑。"

## 硬核补充：代码与深度解析

### 1. 泛型与工具类型实战

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// 场景：更新用户信息时，ID 必填，其他可选
type UpdateUserDto = Pick<User, 'id'> & Partial<Omit<User, 'id'>>;

function updateUser(params: UpdateUserDto) {
  // ...
}

// 调用时会有自动补全，且 id 必传
updateUser({ id: 1, name: "New Name" }); 
\`\`\`

### 2. 泛型请求封装

\`\`\`typescript
async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}

// 使用
interface Product { title: string; price: number }
const product = await request<Product>('/api/product/1');
console.log(product.title); // IDE 自动提示 title
\`\`\`
`
  },
  7: {
    title: "Vite 为什么比 Webpack 快?",
    content: `
## 面试官提问

"现在的项目很多都切到 Vite 了。你能说说 Vite 为什么比 Webpack 快吗？它的核心原理是什么？"

## 面试高分回答 (逐字稿)

"Vite 快的原因主要有两点：**按需编译** 和 **双引擎架构**。

Webpack 启动时，需要把整个项目打包一遍，项目越大启动越慢。

而 Vite 另辟蹊径，它利用了浏览器原生的 **ES Module** 支持。启动时，Vite 不打包，直接启动服务器。当浏览器请求哪个模块，Vite 就编译哪个模块，这就是‘按需编译’，所以启动速度极快。

另外，Vite 在处理依赖预构建时，用的是 Go 语言写的 **esbuild**，比 Node.js 写的打包器快 10 到 100 倍。这使得它的冷启动和热更新 (HMR) 都能保持秒级响应。对于 HMR，Vite 只需要重新编译修改的那个文件，复杂度是 O(1)，跟项目整体大小无关。"

## 硬核补充：代码与深度解析

### 1. 原生 ESM 加载机制

Vite 利用浏览器支持 \`<script type="module">\` 的特性：

\`\`\`html
<!-- 浏览器直接发起 HTTP 请求获取 main.js -->
<script type="module" src="/src/main.js"></script>
\`\`\`

### 2. esbuild 预构建配置 (vite.config.ts)

\`\`\`typescript
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // 强制预构建某些包
    include: ['lodash-es', 'axios'],
    // 使用 esbuild 进行依赖预打包，速度极快
    esbuildOptions: {
      target: 'es2020',
    }
  }
});
\`\`\`
`
  },
  8: {
    title: "ESM 与 CommonJS 差异及互操作",
    content: `
## 面试官提问

"前端模块化标准有很多，CommonJS 和 ESM 有什么本质区别？特别是在引用机制上，两者有什么不一样？"

## 面试高分回答 (逐字稿)

"这两种模块化标准我都用过，它们最大的区别在于**加载机制**和**值的引用**。

CommonJS (CJS) 是 Node.js 的标准，它是**运行时加载**，同步执行的。它导出的值是**值的拷贝**。这意味着一旦输出了，模块内部的变化外部是不知道的。

而 ES Modules (ESM) 是浏览器和现在的标准，它是**编译时静态分析**，异步加载的。它导出的是**值的引用 (Live Binding)**。这意味着模块内部变量变了，外部导入的值也会跟着变。

正是因为 ESM 支持静态分析，所以工具链才能实现 **Tree Shaking**，把没用到的代码摇掉。在互操作方面，ESM 可以 import CJS，但 CJS 没法直接 require ESM，因为 ESM 是异步的。"

## 硬核补充：代码与深度解析

### 1. 值的拷贝 vs 值的引用

\`\`\`javascript
// lib.js (ESM)
export let count = 1;
export function inc() { count++; }

// main.js
import { count, inc } from './lib.js';
console.log(count); // 1
inc();
console.log(count); // 2 -> ESM 是引用，随模块内部变化
\`\`\`

\`\`\`javascript
// lib.js (CommonJS)
let count = 1;
exports.count = count;
exports.inc = () => { count++; };

// main.js
const { count, inc } = require('./lib.js');
console.log(count); // 1
inc();
console.log(count); // 1 -> CJS 是拷贝，不会随内部变化
\`\`\`
`
  },
  9: {
    title: "CDN 部署 SPA：路由模式与缓存策略",
    content: `
## 面试官提问

"SPA 应用部署到 CDN 上，经常会遇到刷新 404 的问题，这个怎么解决？另外，你的静态资源缓存策略一般是怎么配的？"

## 面试高分回答 (逐字稿)

"部署 SPA 到 CDN，最经典的问题就是刷新页面报 404。

这是因为我们通常用的是 History 路由。用户访问 \`/user\`，CDN 上其实没有这个目录，只有一个 \`index.html\`。

所以核心配置是做 **Rewrite (重写)**。以 Nginx 为例，要配置 \`try_files\`，告诉服务器：如果你找不到这个文件，就统统返回 \`index.html\`，把路由管理权交给前端 JS。

另外是**缓存策略**。我的一般做法是：
\`index.html\` 设置 **No-Cache** (或者极短的缓存)，确保用户永远拿最新的入口。
而 JS/CSS 等静态资源，因为打包时文件名带 Hash，我会设置**强缓存 (Cache-Control: max-age=1年)**，最大化利用 CDN 缓存能力。"

## 硬核补充：代码与深度解析

### 1. Nginx 解决 History 路由 404

\`\`\`nginx
server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;

    location / {
        # 核心：找不到文件就返回 index.html
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

### 2. 最佳缓存策略配置

\`\`\`nginx
# HTML 入口：协商缓存 (每次都去问服务器有没有更新)
location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate";
}

# 静态资源 (带 Hash)：强缓存 1 年
location ~* \\.(js|css|png|jpg|jpeg|gif|ico)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
\`\`\`
`
  },
  10: {
    title: "哪些资源不需要浏览器缓存?",
    content: `
## 面试官提问

"浏览器缓存这块，哪些资源你觉得是绝对不能缓存的？哪些又是需要强缓存的？能不能举几个具体的例子？"

## 面试高分回答 (逐字稿)

"关于缓存，我的原则是：**入口文件不缓存，业务资源强缓存，敏感数据绝不缓存**。

具体来说，**HTML 文件 (index.html)** 是绝对不能强缓存的。因为它是整个应用的入口，如果它被缓存了，我们发了新版 JS，用户那边还是旧的 HTML 引用旧的 JS，就永远更新不了了。所以我通常给 HTML 设置 \`no-cache\`，或者 \`max-age=0\`，让浏览器每次都去服务器验证一下 ETag。

另外，**API 接口数据**，特别是涉及用户个人信息、实时库存这些动态数据，也是不需要浏览器缓存的，通常由后端控制 \`no-store\`。

除此以外的 JS、CSS、图片，只要文件名带了 Hash，我都会开启强缓存。"

## 硬核补充：代码与深度解析

### 1. Cache-Control 常用指令对照

*   **no-store**: 绝对禁止缓存（敏感数据、银行余额）。
*   **no-cache**: 可以缓存，但使用前必须去服务器验证（协商缓存，适合 index.html）。
*   **max-age=31536000**: 强缓存一年（适合带 Hash 的静态资源）。

### 2. HTTP 响应头示例

\`\`\`http
# 敏感 API 响应
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
\`\`\`
`
  },
  11: {
    title: "React Fiber 为什么需要双缓存 (Double Buffering)",
    content: `
## 面试官提问

"React 的 Fiber 架构里有个‘双缓存’的概念，能用通俗的话讲讲它是干嘛的吗？它解决了什么问题？"

## 面试高分回答 (逐字稿)

"React Fiber 的双缓存机制，其实和游戏渲染的原理是一样的。

简单来说，React 在内存里维护了两棵树：
一棵是 **Current Tree**，代表当前屏幕上显示的内容。
另一棵是 **WorkInProgress Tree**，是正在构建的新树。

当状态更新时，React 会在 WorkInProgress Tree 上进行计算 (Diff)，这个过程是可以**中断**的。如果不双缓存，直接在 Current Tree 上改，一旦中断，用户就会看到渲染了一半的残缺页面。

有了双缓存，React 可以在后台悄悄把新树画好，等全部计算完成了，直接把指针从 Current 指向 WorkInProgress，瞬间完成替换。这样既实现了可中断渲染，又保证了用户看到的页面始终是完整的。"

## 硬核补充：代码与深度解析

### 1. 双缓存结构示意

\`\`\`javascript
// FiberRootNode
let fiberRoot = {
  current: oldFiberNode, // 指向当前屏幕显示的树
};

// 更新开始时，创建 workInProgress 树
let workInProgress = createWorkInProgress(fiberRoot.current);

// ... 进行 Diff 计算，构建 workInProgress ...

// Commit 阶段：原子操作切换指针
function commitRoot() {
  fiberRoot.current = workInProgress; // 瞬间切换
}
\`\`\`
`
  },
  12: {
    title: "Web 安全：CSRF、XSS、SQL 注入防御",
    content: `
## 面试官提问

"前端安全这块，XSS 和 CSRF 算是老生常谈了。能简单说说它们的原理吗？你在项目里具体是怎么防御的？"

## 面试高分回答 (逐字稿)

"Web 安全是底线问题。我主要关注前端最常见的 **XSS** 和 **CSRF**。

**XSS (跨站脚本攻击)** 核心是‘代码注入’。比如用户在评论区输入了一段 \`<script>\` 脚本。我的防御手段是：永远不信任用户输入，对所有输入做 **转义 (Escape)**。React/Vue 默认已经帮我们做了这步，但在用 \`v-html\` 或 \`dangerouslySetInnerHTML\` 时我会格外小心，通常会配合 **CSP (内容安全策略)** 来兜底。

**CSRF (跨站请求伪造)** 核心是‘借用身份’。比如用户登录了银行网站，又点开了钓鱼网站，钓鱼网站利用用户的 Cookie 发起转账。防御手段主要是：**Cookie 设置 SameSite** 属性，或者使用 **Anti-CSRF Token**，每次请求都带上一个随机 Token，服务器验证通过才放行。

另外虽然 SQL 注入主要是后端问题，但前端也应该始终使用**参数化查询**，绝不手动拼接 SQL 字符串，防患于未然。"

## 硬核补充：代码与深度解析

### 1. XSS 防御：CSP 配置

\`\`\`html
<!-- 在 HTML Head 中设置，限制脚本只能从本站加载 -->
<meta 
  http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' https://trusted.cdn.com;"
>
\`\`\`

### 2. CSRF 防御：SameSite Cookie

\`\`\`javascript
// 后端设置 Cookie 时
res.cookie('session_id', 'xxx', {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict' // 禁止第三方网站带上此 Cookie
});
\`\`\`
`
  },
  13: {
    title: "React 性能优化实战方案",
    content: `
## 面试官提问

"React 项目做久了容易卡顿，你在实战中有哪些具体的性能优化手段？除了 \`React.memo\` 这种，还有别的吗？"

## 面试高分回答 (逐字稿)

"React 的性能优化，我认为核心在于**减少不必要的渲染**。

在我的项目中，我通常会从这几个方面入手：

第一，**控制渲染范围**。对于大型列表项或纯展示组件，我会用 \`React.memo\` 包裹，确保只有 Props 变了才重渲染。

第二，**稳定引用**。配合 \`useCallback\` 和 \`useMemo\`，避免因为父组件更新导致传给子组件的函数引用变了，从而破坏了 memo 的效果。

第三，**大数据渲染**。如果列表有成千上万条数据，我会直接上 **虚拟列表 (Virtual List)**，只渲染视口内的元素，DOM 节点永远保持在几十个，性能非常稳。

当然，最基本的**路由懒加载**和**图片懒加载**也是必做的。"

## 硬核补充：代码与深度解析

### 1. React.memo 与 useCallback 配合

\`\`\`typescript
// 子组件：只在 onClick 变化时更新
const Child = React.memo(({ onClick }) => {
  console.log('Child render');
  return <button onClick={onClick}>Click</button>;
});

// 父组件
const Parent = () => {
  const [count, setCount] = useState(0);

  // 关键：使用 useCallback 保持函数引用稳定
  // 如果不加，每次 Parent 更新都会生成新的 handleClick，导致 Child 重渲染
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); 

  return (
    <div>
      <p>{count}</p>
      <Child onClick={handleClick} />
    </div>
  );
};
\`\`\`
`
  },
  14: {
    title: "HTTPS 密钥交换原理",
    content: `
## 面试官提问

"HTTPS 我们天天用，能讲讲它建立连接握手的时候，到底发生了什么吗？密钥是怎么交换的？为什么需要非对称加密？"

## 面试高分回答 (逐字稿)

"HTTPS 的核心目的是在不安全的网络上建立安全的通信通道。它的原理可以概括为：**非对称加密传钥匙，对称加密传数据**。

在 TLS 握手阶段，服务器会把它的 **公钥** 藏在数字证书里发给浏览器。数字证书由 CA 签发，能防止**中间人攻击**。

浏览器验证证书合法后，生成一个**随机密钥 (Pre-master secret)**，用服务器的公钥加密发回去。

服务器用自己的 **私钥** 解密，拿到这个随机密钥。

这时候，双方都拿到了同一个密钥，且只有双方知道。接下来，双方就用这个密钥进行**对称加密**通信，这样既安全又高效（因为对称加密比非对称快得多）。"

## 硬核补充：代码与深度解析

### 1. 握手流程可视化

\`\`\`
Browser (Client)                Server
   |                              |
   | --- 1. ClientHello --------> | (支持的加密套件)
   |                              |
   | <-- 2. ServerHello --------- | (选定的套件 + 证书/公钥)
   |                              |
   | [验证证书，生成随机密钥 R]     |
   | [用公钥加密 R -> Enc(R)]       |
   |                              |
   | --- 3. Enc(R) -------------> |
   |                              |
   |                       [私钥解密 -> 拿到 R]
   |                              |
   | <-- 4. Finished (加密通信) -> | (双方都用 R 进行对称加密)
\`\`\`
`
  },
  15: {
    title: "单页应用 (SPA) 首屏加载优化",
    content: `
## 面试官提问

"SPA 首屏慢是通病。如果让你来优化一个首屏加载很慢的 React 应用，你会从哪些方面入手？"

## 面试高分回答 (逐字稿)

"SPA 首屏慢是老生常谈了，主要是因为 Bundle 体积太大。我的优化思路通常是**‘拆’、‘缩’、‘预’**。

**拆**：就是 **Code Splitting**。把一个大 Bundle 拆成多个小 Chunk。路由懒加载是最基本的，还可以把大的第三方库（如 ECharts）单独拆分或走 CDN。

**缩**：压缩资源。开启 Gzip/Brotli，图片转 WebP，Tree Shaking 去除死代码。

**预**：**SSR** 是终极方案，直接返回 HTML。如果不方便上 SSR，我会用 **骨架屏** 来提升感官体验，或者利用浏览器空闲时间 **Prefetch** 下一个页面的资源。

通过这几套组合拳，通常能把 FCP 控制在 1秒以内。"

## 硬核补充：代码与深度解析

### 1. Vite/Rollup 分包配置 (vite.config.ts)

\`\`\`typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // 将 React 相关库打包成单独文件
        'react-vendor': ['react', 'react-dom'],
        // 将大图表库单独打包
        'echarts': ['echarts']
      }
    }
  }
}
\`\`\`
`
  },
  16: {
    title: "常见前端性能优化手段",
    content: `
## 面试官提问

"除了首屏加载，平时开发中还有哪些通用的性能优化手段？比如滚动卡顿这种问题怎么解？"

## 面试高分回答 (逐字稿)

"前端性能优化是一个系统工程，除了刚才提到的首屏优化，在交互层面的优化也很重要。

首先是 **高频事件处理**。对于 Scroll、Resize、Input 搜索这些事件，我一定会做 **防抖 (Debounce)** 或 **节流 (Throttle)**，避免函数被疯狂调用。

其次是 **渲染优化**。尽量减少 **重排 (Reflow)** 和 **重绘 (Repaint)**。比如修改样式时，通过切换 class 一次性修改，而不是一条条改 style。动画优先用 CSS Transform，因为它走 GPU 加速，不触发重排。

最后是 **计算优化**。如果有纯计算的耗时逻辑，我会把它丢到 **Web Worker** 里去跑，绝对不让它阻塞主线程，保证页面滚动的流畅性。"

## 硬核补充：代码与深度解析

### 1. 防抖 (Debounce) 实现

\`\`\`javascript
// 场景：搜索框输入，停止输入 500ms 后才发送请求
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}

const handleSearch = debounce((text) => {
  api.search(text);
}, 500);
\`\`\`
`
  },
  17: {
    title: "前端性能监控指标采集方案",
    content: `
## 面试官提问

"你们线上的性能情况是怎么监控的？有哪些核心指标？具体是怎么采集和上报的？"

## 面试高分回答 (逐字稿)

"做性能优化，不能靠猜，必须要有数据支撑。我在项目中搭建了一套前端性能监控体系。

我们主要关注 Google 提出的 **Web Vitals** 核心指标：
**LCP (最大内容绘制)**：衡量加载速度。
**FID (首次输入延迟)**：衡量交互响应度。
**CLS (累积布局偏移)**：衡量视觉稳定性（页面有没有乱跳）。

具体的采集方案是使用浏览器原生的 **PerformanceObserver API**。我们在页面初始化时注册监听器，捕获这些指标，然后通过 \`requestIdleCallback\` 在浏览器空闲时上报到日志服务器。我们通常使用 \`navigator.sendBeacon\` 来上报，确保即使页面关闭数据也能发送出去。有了这些数据，我们就能知道用户端的真实体验到底怎么样了。"

## 硬核补充：代码与深度解析

### 1. LCP 监控代码实现

\`\`\`javascript
// 监听 LCP (Largest Contentful Paint)
const observer = new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
  
  // 上报数据
  navigator.sendBeacon('/api/log', JSON.stringify({
    metric: 'LCP',
    value: lastEntry.startTime
  }));
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });
\`\`\`
`
  },
  18: {
    title: "React 和 Vue 技术层面的区别",
    content: `
## 面试官提问

"React 和 Vue 你都用过，从技术原理或者设计理念上，你觉得它俩最大的区别是什么？不要只说写法不一样。"

## 面试高分回答 (逐字稿)

"React 和 Vue 我都用过，我觉得它们最大的区别在于**设计理念**。

Vue 像是**‘自动挡’**。它的核心是**可变数据**和**依赖收集**。你修改数据，系统通过 Object.defineProperty 或 Proxy 自动拦截并更新视图，非常符合直觉，上手快。

React 像是**‘手动挡’**。它强调**不可变数据 (Immutable)** 和 **函数式编程**。状态变了，整个组件树重新运行 (Diff)，你需要手动配合 \`useEffect\`、\`useMemo\` 来控制副作用和性能。

虽然 Vue3 的 Composition API 和 React Hooks 很像，但底层逻辑完全不同：Vue 的 setup 只运行一次，而 React 的组件函数每次渲染都会重新运行。这也是为什么 React 会有闭包陷阱，而 Vue 没有的原因。"

## 硬核补充：代码与深度解析

### 1. 响应式原理对比

**Vue 3 (Proxy):**
\`\`\`javascript
const state = reactive({ count: 0 });
// 自动拦截 set 操作，触发更新
state.count++; 
\`\`\`

**React (Immutable):**
\`\`\`javascript
const [count, setCount] = useState(0);
// 必须调用 setState，且不能直接修改原值
setCount(count + 1); 
\`\`\`
`
  },
  19: {
    title: "对前端工程化的理解",
    content: `
## 面试官提问

"现在大家都在谈‘前端工程化’，你心目中的工程化到底包含了哪些内容？你是怎么在项目中落地工程化的？"

## 面试高分回答 (逐字稿)

"很多人觉得工程化就是配配 Webpack，但在我看来，工程化的本质是**‘让一群人像一个人一样写代码’**，以及**‘把重复的工作交给机器’**。

它包含四个维度：
一是**模块化**，ESM、Component，复用代码。
二是**规范化**，ESLint、Prettier、CommitLint，统一标准。
三是**自动化**，CI/CD 流水线，自动测试、自动构建、自动部署。
四是**监控体系**，错误监控、性能监控，确保线上稳定性。

我的目标是：新同事入职，跑一个命令就能把环境搭好；提交代码，不用担心风格不一致；发布上线，喝杯咖啡机器就搞定了。"

## 硬核补充：代码与深度解析

### 1. Husky + CommitLint 规范落地

\`\`\`javascript
// .husky/commit-msg
npx --no -- commitlint --edit ${1}

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 规则：type(scope): subject
  // feat: add new feature
};
\`\`\`
`
  },
  20: {
    title: "为什么会有跨域 解决方案有哪些",
    content: `
## 面试官提问

"跨域问题开发中经常遇到，能解释下为什么会有跨域吗？在开发环境和生产环境，你一般分别怎么解决？"

## 面试高分回答 (逐字稿)

"跨域是浏览器的**同源策略**导致的，它是个安全机制，不是 Bug。

解决跨域，我常用的就三招：
在**开发环境**，我直接用 Vite 或 Webpack 的 **Proxy** 配置。原理就是启动一个 Node 代理服务器，因为服务器之间通信是不受限制的，代理帮我转发请求，欺骗浏览器。

在**生产环境**，通常是用 **Nginx 反向代理**，把 API 请求转发到后端服务，保持同源。

如果需要跨域共享资源（比如开放平台），那就需要后端配合设置 **CORS** 响应头，允许特定的域名访问，并处理好预检请求 (Options)。"

## 硬核补充：代码与深度解析

### 1. Vite Proxy 配置 (开发环境)

\`\`\`typescript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://backend.com',
        changeOrigin: true, // 关键：修改 Host 头，欺骗后端
        rewrite: (path) => path.replace(/^\\/api/, '')
      }
    }
  }
}
\`\`\`

### 2. CORS 响应头 (后端/Nginx)

\`\`\`http
Access-Control-Allow-Origin: https://my-frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
\`\`\`
`
  }
};

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 生成 Markdown 文件
Object.keys(knowledgeBase).forEach(key => {
  const item = knowledgeBase[key];
  const cleanTitle = item.title.replace(/[\\/:*?"<>|]/g, '');
  
  // 提取简短回答 (用于技术文档)
  // 策略：从逐字稿中提取包含"简单来说"或粗体强调的段落，作为Brief Answer
  let briefAnswer = "";
  const verbatimMatch = item.content.match(/## 面试高分回答 \(逐字稿\)\s*([\s\S]*?)(?=## 硬核补充|$)/);
  if (verbatimMatch) {
    const verbatimText = verbatimMatch[1].trim();
    const paragraphs = verbatimText.split(/\n\s*\n/);
    // 优先找包含"简单来说"或粗体的段落
    const targetPara = paragraphs.find(p => p.includes("简单来说") || p.includes("**")) || paragraphs[0];
    // 去除可能的首尾引号
    briefAnswer = targetPara ? targetPara.replace(/^["“]/, '').replace(/["”]$/, '') : "";
  }

  // 1. 生成纯技术解析版 (只包含硬核补充，去掉逐字稿)
  // 按照用户要求，参考第1题的样式：独立的技术文档
  const filenameTech = `${key}. ${cleanTitle}.md`;
  const filePathTech = path.join(outputDir, filenameTech);
  
  // 分割内容
  const separator = '## 硬核补充：代码与深度解析';
  const parts = item.content.split(separator);
  
  if (parts.length > 1) {
    const deepDiveContent = parts[1].trim();
    // 技术版：标题 + 简短回答 + 分隔符 + 硬核内容
    const fileContentTech = `# ${item.title}\n\n## 简短回答\n\n${briefAnswer}\n\n---\n\n## 1. 硬核补充\n\n${deepDiveContent.replace(/^### /, '### ')}`; 
    // 注意：原hardcore内容通常以###开头，为了层级好看，这里可能不需要额外调整，或者保留原样。
    // 参考用户提供的Q1文件，结构是：## 简短回答 -> --- -> ## 1. 核心差异对比 (这里对应硬核补充)
    // 我们的硬核补充里已经是 ### 1. ... 
    // 所以我们可以把 "## 硬核补充..." 这个大标题去掉，直接用简短回答+分隔符+具体的小节。
    // 但是 parts[1] 是从 "## 硬核补充..." 切分后的内容，所以它开头就是 "### 1. ..."
    
    // 修正：生成的结构应该是：
    // # Title
    // ## 简短回答
    // ...
    // ---
    // (这里直接接 parts[1]，即 ### 1. ...)
    // 或者加一个 "## 深度解析" 的二级标题?
    // 用户Q1参考文件是: ## 1. 核心差异对比 (这是它自己的二级标题).
    // 我们的 parts[1] 是 "### 1. ...". 
    // 也许我们应该把 parts[1] 里的 ### 提升为 ## ?
    // 或者直接保留。为了稳妥，我直接拼接。
    
    const fileContentTechFinal = `# ${item.title}\n\n## 简短回答\n\n${briefAnswer}\n\n---\n\n${deepDiveContent}`;
    
    fs.writeFileSync(filePathTech, fileContentTechFinal, 'utf8');
    console.log(`Generated Tech: ${filenameTech}`);
  } else {
    // 如果没有硬核补充，则生成只有标题的文件，或者保留原内容（视情况而定，这里假设都有补充）
    console.log(`Skipping Tech (No content): ${filenameTech}`);
  }

  // 2. 生成纯逐字稿版 (只包含提问和回答)
  const filenameScript = `${key}. ${cleanTitle} 逐字稿.md`;
  const filePathScript = path.join(outputDir, filenameScript);
  const scriptContentStr = parts[0].trim();
  
  const fileContentScript = `# ${item.title}\n\n${scriptContentStr}`;
  fs.writeFileSync(filePathScript, fileContentScript, 'utf8');
  console.log(`Generated Script: ${filenameScript}`);
});

console.log('All files generated successfully.');
