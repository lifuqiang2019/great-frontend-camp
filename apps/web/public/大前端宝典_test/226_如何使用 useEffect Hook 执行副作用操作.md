# 如何使用 useEffect Hook 执行副作用操作

```javascript
import React, { useState, useEffect } from 'react';  
  
function MyComponent() {  
const \[data, setData\] = useState(null);  
  
useEffect(() => {  
// 在组件渲染后执行副作用操作  
fetchData();  
}, \[\]);  
  
const fetchData = async () => {  
const response = await fetch('https://api.example.com/data');  
const data = await response.json();  
setData(data);  
};  
  
return <div>Data: {data}</div>;  
}

```
