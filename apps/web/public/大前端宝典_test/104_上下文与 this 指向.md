# 上下文与 this 指向

```javascript
globalThis.a = 100;  
function fn() {  
return {  
a: 200,  
m: function() {  
console.log(this.a);  
},  
n: ()=>{  
console.log(this.a);  
},  
k: function() {  
return function() {  
console.log(this.a)  
}  
}  
};  
}  
  
const fn0 = fn();  
fn0.m(); // 输出 200，this 指向 {a, m, n}  
fn0.n(); // 输出 100，this 指向 globalThis  
fn0.k()(); // 输出 100, this 指向 globalThis  
  
const context = {a: 300}  
const fn1 = fn.call(context); // 改变箭头函数 this 指向  
fn1.m(); // 输出 200，this 指向 {a, m, n}  
fn1.n(); // 输出 300，this 指向 context  
fn1.k().call(context); // 输出 300，this 指向 context

```
