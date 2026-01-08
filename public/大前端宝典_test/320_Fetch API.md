# Fetch API

**背景：**

1.  **起初提案：** Fetch API 最早是由WHATWG提出的，旨在改进和取代 XMLHttpRequest ，以提供更强大、现代和一致的方式进行网络请求。
2.  **标准草案：** Fetch API 的标准化工作得到了广泛支持，于2014年成为Web标准的一部分。它首先出现在WHATWG的"Fetch Living Standard"（规范草案）中。
3.  **W3C标准化：** 后来，Fetch API 作为Fetch标准被W3C采纳，并成为W3C的"Fetch Living Standard"。这个标准于2017年成为W3C的 推荐标准 ，这意味着它成为了Web开发的正式标准。

**调用方法：**

```javascript
fetch('https://api.example.com/data') // 发起GET请求  
.then(response => {  
if (!response.ok) {  
throw new Error('Network response was not ok');  
}  
return response.json(); // 解析响应为JSON  
})  
.then(data => {  
// 在这里处理从服务器返回的数据console.log(data);  
})  
.catch(error => {  
// 处理任何网络请求错误console.error('Fetch error:', error);  
});  
  
fetch('https://api.example.com/data', {  
method: 'POST',  
headers: {  
'Content-Type': 'application/json',  
'Authorization': 'Bearer YourAccessToken'  
},  
body: JSON.stringify({ key: 'value' }) // 将数据发送到服务器  
}).then(response => {  
// 处理响应  
}).catch(error => {  
// 处理错误  
});

```
