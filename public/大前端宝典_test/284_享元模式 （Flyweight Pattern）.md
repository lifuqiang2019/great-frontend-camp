# 享元模式 （Flyweight Pattern）

用于减少对象的数量，以节省 内存 或计算成本。

```javascript
// 具体享元对象：图标  
class Icon {  
constructor(name, path) {  
this.name = name;  
this.path = path;  
}  
  
render(x, y) {  
console.log(\`Render ${this.name} at position (${x}, ${y})\`);  
}  
}  
  
// 享元工厂：图标工厂  
class IconFactory {  
constructor() {  
this.icons = {};  
}  
  
getIcon(name, path) {  
if (!this.icons\[name\]) {  
this.icons\[name\] = new Icon(name, path);  
}  
return this.icons\[name\];  
}  
}  
  
// 使用享元模式  
const iconFactory = new IconFactory();  
  
const icon1 = iconFactory.getIcon("star", "/path/to/star.png");  
const icon2 = iconFactory.getIcon("heart", "/path/to/heart.png");  
const icon3 = iconFactory.getIcon("star", "/path/to/star.png");  
  
icon1.render(10, 10);  
icon2.render(20, 20);  
icon3.render(30, 30);  
  
// 输出:  
// Render star at position (10, 10)  
// Render heart at position (20, 20)  
// Render star at position (30, 30)

```
