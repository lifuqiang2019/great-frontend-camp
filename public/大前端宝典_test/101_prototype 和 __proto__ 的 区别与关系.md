# prototype 和 \_\_proto\_\_ 的 区别与关系

- **prototype** **：**
- 函数对象（构造函数）特有属性，每个函数对象都有一个 prototype 属性，它是一个对象。
- 通常用于定义共享的属性和方法，可以被构造函数创建的实例对象所 继承 。可以在构造函数的 prototype 上定义方法，以便多个实例对象共享这些方法，从而节省 内存 。
- 主要用于原型 继承 ，它是构造函数和实例对象之间的链接，用于共享方法和属性。
- **\_\_proto\_\_** **：**
- 每个对象（包括函数对象和普通对象）都具有的属性，它指向对象的原型，也就是它的父对象。
- 用于实现原型链，当你访问一个对象的属性时，如果对象本身没有这个属性， JavaScript 引擎会沿着原型链（通过 \_\_proto\_\_ 属性）向上查找，直到找到属性或到达原型链的顶部（通常是 Object.prototype ）。
- 主要用于对象之间的 继承 ，它建立了对象之间的原型关系。
- **总结：**prototype 和**\_\_proto\_\_**是不同的，但它们在 JavaScript 中一起用于实现原型 继承 。构造函数的 prototype 对象会被赋予给实例对象的**\_\_protpo\_\_** 属性，从而建立了原型链。

```javascript
// 创建一个构造函数  
function Person(name) {  
this.name = name;  
}  
  
// 在构造函数的 prototype 上定义一个方法  
Person.prototype.sayHello = function() {  
console.log(\`Hello, my name is ${this.name}\`);  
}  
  
// 创建一个实例对象  
const person1 = new Person("Alice");  
  
// 访问实例对象的属性和方法  
console.log(person1.name); // 输出: "Alice"  
person1.sayHello(); // 输出: "Hello, my name is Alice"  
  
// 查看实例对象的 \_\_proto\_\_ 属性，它指向构造函数的 prototype 对象  
console.log(person1.\_\_proto\_\_ === Person.prototype); // 输出: true

```
- 首先定义了一个构造函数 Person ，然后在构造函数的 prototype 上定义了一个方法 sayHello 。接着，创建了一个 person1 实例对象，并访问了它的属性和方法。最后，验证了 person1 实例对象的 **proto** 属性确实指向构造函数 Person 的 prototype 对象，建立了原型链关系。
