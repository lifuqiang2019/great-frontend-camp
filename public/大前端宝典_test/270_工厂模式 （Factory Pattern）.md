# 工厂模式 （Factory Pattern）

用于创建对象，封装创建对象的逻辑。

```javascript
// 工厂类  
class ShapeFactory {  
createShape(type) {  
if (type === "circle") {  
return new Circle();  
} else if (type === "rectangle") {  
return new Rectangle();  
} else if (type === "triangle") {  
return new Triangle();  
} else {  
throw new Error("Invalid shape type");  
}  
}  
}  
  
// 不同的具体产品类  
class Circle {  
draw() {  
console.log("Drawing a circle");  
}  
}  
  
class Rectangle {  
draw() {  
console.log("Drawing a rectangle");  
}  
}  
  
class Triangle {  
draw() {  
console.log("Drawing a triangle");  
}  
}  
  
// 使用工厂创建对象  
const factory = new ShapeFactory();  
const circle = factory.createShape("circle");  
const rectangle = factory.createShape("rectangle");  
const triangle = factory.createShape("triangle");  
  
circle.draw(); // 输出: Drawing a circle  
rectangle.draw(); // 输出: Drawing a rectangle  
triangle.draw(); // 输出: Drawing a triangle

```
