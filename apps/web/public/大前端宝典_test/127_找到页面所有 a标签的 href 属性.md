# 找到页面所有 a标签的 href 属性

```javascript
Array.from(document.getElementsByTagName('a')).map(item => item.href);

```
