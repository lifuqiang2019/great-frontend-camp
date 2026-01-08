# TypeScript 类型注解（Type Annotations）

TypeScript提供的核心特性之一，旨在在编译时期捕获并防止类型相关的错误，从而提高代码的可靠性和可维护性。

1.  **变量的类型注解**

你可以为变量指定类型，确保变量只能存储特定类型的值。

```typescript
let name: string = "Alice";  
let age: number = 30;  
let isStudent: boolean = true;

1.  **函数参数和返回值的类型注解**

在函数中，你可以为参数和返回值指定类型。

```

```typescript
function greet(name: string): string {  
return "Hello, " + name;  
}

1.  **接口（Interface）和类型别名（Type Aliases）**

TypeScript还允许使用接口或类型别名来定义对象的结构。

```

```typescript
interface Person {  
name: string;  
age: number;  
}  
  
let employee: Person = {  
name: "Bob",  
age: 25  
};  
  
type Point = {  
x: number;  
y: number;  
};  
  
let coord: Point = {  
x: 10,  
y: 20  
};

```
