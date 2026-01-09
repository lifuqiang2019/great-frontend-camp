# 字符串 "abcde" 如何反转

```javascript
// 方案一  
const str = 'abcde';  
str.split('').reverse().join('');  
  
// 方案二  
const str = 'hello world';  
const resultStr = Array.from(str).reduce((pre, cur) => {  
return \`${cur}${pre}\`;  
}, '');  
console.log(resultStr);

```
