# XMLHttpRequest 对象用法

XMLHttpReques t对象是用于在后台与服务器进行 异步通信 的核心对象之一。

```javascript
// 创建XMLHttpRequest对象  
const xhr = new XMLHttpRequest();  
  
// 注册回调函数，当请求完成时调用  
xhr.onload = function() {  
if (xhr.status === 200) {  
// 处理返回的数据  
console.log(xhr.responseText);  
} else {  
// 处理错误信息  
console.error('请求失败：' + xhr.status);  
}  
};  
  
// 发送请求  
xhr.open('GET', 'https://api.example.com/data', true);  
xhr.send();

在上面的代码中，首先创建一个 XMLHttpRequest 对象，然后注册一个 onload 回调函数 ，在请求完成时调用。在回调函数中，可以根据请求的状态码判断请求是否成功，并处理返回的数据或错误信息。最后，使用 open 方法设置请求的类型（GET、POST等）、 URL 和异步标志，使用 send 方法发送请求。

```
**一些常用的方法和属性：**

- open(method, url, async) ：设置请求的类型、URL和异步标志。
- send(data) ：发送请求，并可选地传递数据。
- abort() ：取消当前请求。
- setRequestHeader(name, value) ：设置请求头信息。
- getResponseHeader(name) ：获取指定名称的响应头信息。
- getAllResponseHeaders() ：获取所有响应头信息。
- status ：获取请求的状态码。
- statusText ：获取请求的状态文本。
- responseText ：获取响应的文本内容。
- responseXML ：获取响应的XML文档对象。

**注意：** XMLHttpRequest 对象的使用方式可能因浏览器而异，某些浏览器可能不支持某些方法或属性。因此，在使用XMLHttpRequest 对象时，需要注意 兼容性 问题，并根据具体需求选择合适的方法和属性。
