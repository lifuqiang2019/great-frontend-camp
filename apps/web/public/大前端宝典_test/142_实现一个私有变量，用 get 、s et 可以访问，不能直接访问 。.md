# 实现一个私有变量，用 get 、s et 可以访问，不能直接访问 。

```javascript
const privateName = Symbol();  
  
class Person {  
constructor(name) {  
// 使用 Symbol 作为属性名  
this\[privateName\] = name;  
}  
  
// 使用 get 方法访问私有变量  
getName() {  
return this\[privateName\];  
}  
  
// 使用 set 方法修改私有变量  
setName(name) {  
this\[privateName\] = name;  
}  
}  
  
const myPerson = new Person("哲玄");  
  
console.log(myPerson.getName()); // 通过 get 方法访问私有变量 输出 哲玄  
myPerson.setName("sam"); // 通过 set 方法修改私有变量  
console.log(myPerson.getName()); // 输出: "sam"

```
