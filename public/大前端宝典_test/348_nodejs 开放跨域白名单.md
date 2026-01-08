# nodejs 开放跨域白名单

```javascript
app.use(async (ctx, next) => {  
// 允许跨域请求的源（白名单）  
const allowedOrigins = \['http://127.0.0.1:3000'\];  
const requestOrigin = ctx.headers.origin;  
// 检查请求的来源是否在允许的白名单中  
if (allowedOrigins.includes(requestOrigin)) {  
// 设置响应头以允许跨域  
ctx.set('Access-Control-Allow-Origin', requestOrigin);  
ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');  
ctx.set('Access-Control-Allow-Headers', 'Content-Type');  
ctx.set('Access-Control-Allow-Credentials', 'true'); // 允许携带身份验证信息（例如 Cookie）  
}  
await next();  
});

```
