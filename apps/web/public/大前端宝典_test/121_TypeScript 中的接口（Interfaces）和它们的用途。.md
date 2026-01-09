# TypeScript 中的接口（Interfaces）和它们的用途。

接口（Interfaces）是一个非常强大的特性，用于定义对象的结构。接口可以指定一个对象应该有哪些属性以及这些属性的类型。它们是TypeScript进行静态类型检查的重要工具，尤其是在处理复杂数据结构时。接口不仅可以帮助你定义复杂类型，还能提高代码的可读性和维护性，确保在开发过程中使用一致的数据结构。

1.  **定义对象结构**

```typescript
interface Person {  
name: string;  
age: number;  
}

1.  **函数参数**

```

```typescript
function greet(person: Person) {  
console.log("Hello, " + person.name);  
}

1.  **强制实现特定的类结构**

接口可以被类实现（Implements），这意味着类必须包含接口中定义的所有属性和方法。这是一种确保类满足特定契约的方式。

```

```typescript
interface ClockInterface {  
currentTime: Date;  
setTime(d: Date): void;  
}  
  
class Clock implements ClockInterface {  
currentTime: Date = new Date();  
setTime(d: Date) {  
this.currentTime = d;  
}  
}

1.  **继承**

接口可以继承其他接口，这允许你从一个或多个基接口复制成员，创建出包含所有成员的新接口。

```

```typescript
interface Shape {  
color: string;  
}  
  
interface Square extends Shape {  
sideLength: number;  
}

```
