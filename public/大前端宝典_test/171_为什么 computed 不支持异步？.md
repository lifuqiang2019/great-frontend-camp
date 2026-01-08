# 为什么 computed 不支持异步？

这个是 vue 设计层面决定的，computed 的定义是，“依赖值改变computed值就会改变”，所以这里必须是同步的，否则就可能 “依赖值改变但computed值未改变了”，一旦computed 支持异步，computed 就违背定义了，会变得不稳定。相反，watch 的定义是，“监控的数据改变后，它做某件事”，那 watch 在监听变化后，做同步异步都可以，并不违背定义。

```javascript
// 有效  
computed: {  
async value() {  
return this.a + this.b; // 有效  
}  
},  
  
// 无效  
computed: {  
async value() { // 外部接住 promise  
const res = await new Promise(resolve => {  
setTimeout(() => {  
resolve(this.a + this.b);  
});  
});  
console.log(res); // 输出3  
return res;  
}  
}

```
