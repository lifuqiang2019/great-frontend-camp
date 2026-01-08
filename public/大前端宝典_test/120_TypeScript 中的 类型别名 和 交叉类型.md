# TypeScript 中的 类型别名 和 交叉类型

**类型别名（Type Aliases）**

类型别名让你可以给一个类型起一个新的名字。这不仅仅限于对象类型，也可以适用于联合类型、元组以及任何其他类型。类型别名定义使用 type 关键字。

```typescript
type Point = {  
x: number;  
y: number;  
};  
type ID = string | number;

```
**交叉类型（Intersection Types）**

将多个类型合并为一个类型，这个新类型将具有所有成员类型的特性。这是通过使用 & 操作符来实现的。

```typescript
type Name = {  
name: string;  
};  
type Age = {  
age: number;  
};  
type Person = Name & Age;

```
