# 实现一个 once 函数，传入函数参数只执行一次

```javascript
function once(fn) {  
let called = false; // 用来记录函数是否已经被调用过  
  
return function (...args) {  
if (!called) {  
called = true;  
return fn(...args);  
}  
};  
}  
  
// 使用示例  
const doSomethingOnce = once(function () {  
console.log("This will only be executed once.");  
});  
  
doSomethingOnce(); // 打印 "This will only be executed once."  
doSomethingOnce(); // 这次不会执行

```
