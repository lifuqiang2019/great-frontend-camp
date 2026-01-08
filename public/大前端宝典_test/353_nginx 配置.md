# nginx 配置

Nginx  
\# 全局配置段  
user nginx; # Nginx worker 进程的运行用户  
worker\_processes 4; # 启动4个 worker 进程以处理请求  
error\_log /var/log/nginx/error.log;  
pid /var/run/nginx.pid;  

\# 事件处理段  
events {  
worker\_connections 1024; # 每个 worker 进程处理的最大连接数  
}  

\# HTTP服务器段  
http {  
include /etc/nginx/mime.types; # 包含MIME类型配置文件  

\# 服务器配置段  
server {  
listen 80; # 监听端口 80  
server\_name example.com; # 服务器的域名  

\# 根目录和默认文档  
root /var/www/html;  
index index.html;  

location / {  
try\_files $uri $uri/ /index.html; # 尝试查找文件，否则重定向到 index.html  
}  

\# 反向代理示例  
location /api/ {  
proxy\_pass http://backend\_server; # 反向代理到后端服务器  
}  

\# 静态文件缓存  
location ~\* \\.(jpg|jpeg|png|gif|css|js)$ {  
expires 1y; # 缓存静态文件1年  
}  

\# SSL/TLS 配置  
ssl\_certificate /etc/nginx/ssl/server.crt;  
ssl\_certificate\_key /etc/nginx/ssl/server.key;  
}  

\# 配置多个服务器段  
server {  
listen 80;  
server\_name subdomain.example.com;  

location / {  
proxy\_pass http://another\_backend\_server;  
}  
}  
}
