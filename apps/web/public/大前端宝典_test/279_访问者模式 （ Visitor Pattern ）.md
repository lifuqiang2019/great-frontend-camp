# 访问者模式 （ Visitor Pattern ）

封装一系列操作，这些操作在不改变对象结构的前提下作用于对象的各个元素。

```javascript
// 抽象元素类：图形  
class Shape {  
accept(visitor) {  
throw new Error("Subclasses must implement accept(visitor) method");  
}  
}  
  
// 具体元素类：矩形  
class Rectangle extends Shape {  
constructor(width, height) {  
super();  
this.width = width;  
this.height = height;  
}  
  
accept(visitor) {  
visitor.visitRectangle(this);  
}  
}  
  
// 具体元素类：圆形  
class Circle extends Shape {  
constructor(radius) {  
super();  
this.radius = radius;  
}  
  
accept(visitor) {  
visitor.visitCircle(this);  
}  
}  
  
// 抽象访问者  
class Visitor {  
visitRectangle(rectangle) {}  
visitCircle(circle) {}  
}  
  
// 具体访问者：面积计算器  
class AreaCalculator extends Visitor {  
constructor() {  
super();  
this.totalArea = 0;  
}  
  
visitRectangle(rectangle) {  
this.totalArea += rectangle.width \* rectangle.height;  
}  
  
visitCircle(circle) {  
this.totalArea += Math.PI \* Math.pow(circle.radius, 2);  
}  
  
getTotalArea() {  
return this.totalArea;  
}  
}  
  
// 使用访问者模式  
const shapes = \[new Rectangle(5, 10), new Circle(3), new Rectangle(2, 4)\];  
  
const areaCalculator = new AreaCalculator();  
  
for (const shape of shapes) {  
shape.accept(areaCalculator);  
}  
  
console.log("Total area: " + areaCalculator.getTotalArea());

```
