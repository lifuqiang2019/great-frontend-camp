# 实现 sleep 效果

```javascript
async function sleep(time) {  
return new Promise(reslove => {  
setTimeout(() => {  
reslove();  
}, time);  
});  
}  
  
(async() => {  
await sleep(3000);  
console.log('哲玄'); // 3秒后输出哲玄  
})();

```
