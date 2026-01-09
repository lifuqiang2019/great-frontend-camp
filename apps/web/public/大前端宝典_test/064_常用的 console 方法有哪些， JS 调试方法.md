# 常用的 console 方法有哪些， JS 调试方法

```javascript
// 普通打印  
console.log('a');  
  
// 按级别打印  
console.error('a');  
console.warn('a');  
console.info('a');  
console.debug('a');  
  
// 占位符打印  
console.log('%o a', { a: 1 });  
console.log('%s a', 'xx');  
console.log('%d d', 123);  
  
// 打印任何对象，一般用于打印 DOM 节点  
console.dir(document.body);  
  
// 打印表格  
console.table({a: 1, b: 2});  
  
// 计数  
for (let i = 0; i < 10; ++i) { console.count('a'); }  
  
// 分组  
console.group('group1');  
console.log('a');  
console.group('group2');  
console.log('b');  
console.groupEnd('group2');  
console.groupEnd('group1');  
  
// 计时  
console.time('a');  
const now = Date.now();  
while(Date.now() - now < 1000) {}  
console.timeEnd('a');  
  
// 断言  
console.assert(1 === 2, 'error');  
  
// 调用栈  
function a() {  
console.trace();  
}  
function b() {  
a();  
}  
b();  
  
// 内存占用  
console.memory;

```
