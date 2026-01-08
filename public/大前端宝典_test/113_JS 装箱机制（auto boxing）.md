# JS 装箱机制（auto boxing）

为什么以下代码第二行输出 true ，第三行输出 false ？

```javascript
const a = 1;  
console.log(a.\_\_proto\_\_ === Number.prototype); // 输出 true  
console.log(a instanceof Number); // 输出 false

首先，基础类型是没有 \_\_proto\_\_ 的，第二行之所以会输出 true，是因为触发了 js 的 autoboxing 机制，也叫装箱机制，当一个基础类型尝试访问 \_\_propt\_\_ 时，js 会把基础类型临时装箱，理解为 const a = new Number(1) ，所以第二行会输出 true ，而第三行没有触发装箱机制，因此输出 false 。

```
