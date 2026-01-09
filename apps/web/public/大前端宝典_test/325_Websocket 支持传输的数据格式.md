# Websocket 支持传输的数据格式

1.  **文本数据 (Text Data)：** UTF-8 编码的字符串形式传输的。

```javascript
const socket = new WebSocket('wss://example.com/socket');  
  
// 连接打开时发送文本消息  
socket.onopen = () => {  
socket.send('Hello, Server!');  
};  
  
// 接收文本消息  
socket.onmessage = (event) => {  
console.log('Received:', event.data);  
};

1.  **二进制数据 (Binary Data)：** 二进制数据可以有多种形式，包括 ArrayBuffer 和 Blob （在浏览器环境中）。可用于传输复杂的二进制数据，如文件、图像、音视频等。

```

```javascript
const socket = new WebSocket('wss://example.com/socket');  
  
// 连接打开时发送二进制消息  
socket.onopen = () => {  
const buffer = new ArrayBuffer(8);const view = new Uint8Array(buffer);  
view\[0\] = 255; // 示例数据  
socket.send(buffer);  
};  
  
// 接收二进制消息  
socket.onmessage = (event) => {  
if (event.data instanceof ArrayBuffer) {  
const view = new Uint8Array(event.data);  
console.log('Received binary data:', view);  
}  
};

```
