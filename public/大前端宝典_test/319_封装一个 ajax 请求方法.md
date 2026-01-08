# 封装一个 ajax 请求方法

```javascript
function ajaxRequest({ url, method, data, callback }) {  
const xhr = new XMLHttpRequest();  
  
xhr.open(method, url, true);  
  
xhr.onload = function() {  
if (xhr.status === 200) {  
const response = JSON.parse(xhr.responseText);  
callback(null, response);  
} else {  
callback('请求失败：' + xhr.status, null);  
}  
};  
  
xhr.onerror = function() {  
callback('请求错误', null);  
};  
  
xhr.send(data);  
}

**注意：** Axios 的本质也是对 XMLHttpRequest 进行封装。

```
