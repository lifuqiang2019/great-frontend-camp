# 模板方法模式（Template Method Pattern）

定义一个算法的骨架，将一些步骤延迟到子类中实现。

```javascript
// 抽象类：制备饮料  
class Beverage {  
prepare() {  
this.boilWater();  
this.brew();  
this.pourInCup();  
this.addCondiments();  
}  
  
boilWater() {  
console.log("Boiling water");  
}  
  
brew() {  
throw new Error("Subclasses must implement the brew method");  
}  
  
pourInCup() {  
console.log("Pouring into cup");  
}  
  
addCondiments() {  
throw new Error("Subclasses must implement the addCondiments method");  
}  
}  
  
// 具体类：制备咖啡  
class Coffee extends Beverage {  
brew() {  
console.log("Dripping coffee through filter");  
}  
  
addCondiments() {  
console.log("Adding sugar and milk");  
}  
}  
  
// 具体类：制备茶  
class Tea extends Beverage {  
brew() {  
console.log("Steeping the tea");  
}  
  
addCondiments() {  
console.log("Adding lemon");  
}  
}  
  
// 使用模板方法模式  
const coffee = new Coffee();  
const tea = new Tea();  
  
console.log("Making coffee:");  
coffee.prepare();  
  
console.log("\\nMaking tea:");  
tea.prepare();

```
