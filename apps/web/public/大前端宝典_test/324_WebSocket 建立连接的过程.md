# WebSocket 建立连接的过程

1.  **客户端发起 HTTP 握手请求：** 客户端首先向服务器发起一个标准的 HTTP 请求，这个请求包含了一些特定的头部，用于请求建立 WebSocket 连接。

HTTP  
GET /chat HTTP/1.1  
Host: server.example.com  
Upgrade: websocket  
Connection: Upgrade  
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==  
Sec-WebSocket-Version: 13

- GET /chat HTTP/1.1 ：请求的路径和协议版本。
- Host: server.example.com ：服务器的主机名。
- Upgrade: websocket ：表示请求协议升级到 WebSocket。
- Connection: Upgrade ：表示希望升级连接。
- Sec-WebSocket-Key ：Base64 编码的随机密钥，服务器用于生成响应中的 Sec-WebSocket-Accept 。
- Sec-WebSocket-Version ：WebSocket 协议版本，当前版本是 13。

1.  **服务器响应 HTTP 握手请求：** 如果服务器支持 WebSocket 并同意升级连接，则会返回一个 101 Switching Protocols 状态码的响应，表示协议切换成功。

HTTP  
HTTP/1.1 101 Switching Protocols  
Upgrade: websocket  
Connection: Upgrade  
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

- 101 Switching Protocols ：状态码表示协议切换。
- Upgrade: websocket ：确认升级到 WebSocket 协议。
- Connection: Upgrade ：确认连接升级。
- Sec-WebSocket-Accept ：服务器基于客户端提供的 Sec-WebSocket-Key 计算得到值，保证握手安全。

1.  **WebSocket 连接建立**

在服务器响应成功后，客户端和服务器之间的 HTTP 连接就升级为 WebSocket 连接，从此可以进行全双工的实时通信。此时，HTTP 头部已经不再使用，取而代之的是 WebSocket 数据帧。

1.  **连接关闭：** WebSocket 连接可以由客户端或服务器任意一方关闭。关闭连接时，发送一个控制帧表示关闭请求，连接将以有序的方式关闭。
