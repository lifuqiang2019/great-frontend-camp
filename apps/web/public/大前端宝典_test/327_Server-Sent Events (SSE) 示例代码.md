# Server-Sent Events (SSE) 示例代码

**服务端代码：**

```javascript
const http = require('http');  
  
http.createServer((req, res) => {  
res.writeHead(200, {  
'Content-Type': 'text/event-stream',  
'Cache-Control': 'no-cache',  
'Connection': 'keep-alive',  
});  
  
// 发送事件数据  
setInterval(() => {  
res.write(\`data: ${new Date().toLocaleTimeString()}\\n\\n\`);  
}, 1000);  
}).listen(8080, () => {  
console.log('Server is running on http://localhost:8080');  
});

```
**客户端代码：**

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<meta name="viewport" content="width=device-width, initial-scale=1.0">  
<title>SSE Example</title>  
</head>  
<body>  
<button id="start">Start SSE</button>  
<button id="stop">Stop SSE</button>  
<div id="messages"></div>  
  
<script>  
let eventSource;  
  
document.getElementById('start').addEventListener('click', () => {  
eventSource = new EventSource("http://localhost:8080");  
  
eventSource.onmessage = (event) => {  
console.log("Data from server:", event.data);  
document.getElementById('messages').innerHTML += \`<p>${event.data}</p>\`;  
};  
  
eventSource.onopen = () => {  
console.log("Connection opened");  
};  
  
eventSource.onerror = (error) => {  
console.error("Error occurred:", error);  
};  
});  
  
document.getElementById('stop').addEventListener('click', () => {  
if (eventSource) {  
eventSource.close();  
console.log("Connection closed");  
}  
});  
</script>  
</body>  
</html>

```
