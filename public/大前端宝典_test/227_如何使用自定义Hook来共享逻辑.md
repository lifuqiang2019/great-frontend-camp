# 如何使用自定义Hook来共享逻辑

```javascript
import React, { useState, useEffect } from 'react';  
  
function useFetchData(url) {  
const \[data, setData\] = useState(null);  
  
useEffect(() => {  
fetchData();  
}, \[url\]);  
  
const fetchData = async () => {  
const response = await fetch(url);  
const data = await response.json();  
setData(data);  
};  
  
return data;  
}  
  
function MyComponent() {  
const data = useFetchData('https://api.example.com/data');  
  
return <div>Data: {data}</div>;  
}

```
**前端构建 & 工程化 题目**
