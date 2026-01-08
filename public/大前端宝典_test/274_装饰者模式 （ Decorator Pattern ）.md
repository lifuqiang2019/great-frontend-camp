# 装饰者模式 （ Decorator Pattern ）

用于动态地给对象添加新功能或职责。

```javascript
// 基础组件接口  
class Coffee {  
cost() {  
return 5;  
}  
}  
  
// 具体组件  
class SimpleCoffee extends Coffee {  
cost() {  
return super.cost();  
}  
}  
  
// 装饰器基类  
class CoffeeDecorator extends Coffee {  
constructor(coffee) {  
super();  
this.\_coffee = coffee;  
}  
  
cost() {  
return this.\_coffee.cost();  
}  
}  
  
// 具体装饰器类 - 牛奶装饰  
class MilkDecorator extends CoffeeDecorator {  
cost() {  
return super.cost() + 2;  
}  
}  
  
// 具体装饰器类 - 糖装饰  
class SugarDecorator extends CoffeeDecorator {  
cost() {  
return super.cost() + 1;  
}  
}  
  
// 具体装饰器类 - 奶泡装饰  
class FoamDecorator extends CoffeeDecorator {  
cost() {  
return super.cost() + 3;  
}  
}  
  
// 客户端代码  
const coffee = new SimpleCoffee();  
console.log(\`Cost: $${coffee.cost()}\`); // $5  
  
const coffeeWithMilk = new MilkDecorator(coffee);  
console.log(\`Cost: $${coffeeWithMilk.cost()}\`); // $7  
  
const coffeeWithSugar = new SugarDecorator(coffee);  
console.log(\`Cost: $${coffeeWithSugar.cost()}\`); // $6  
  
const coffeeWithMilkAndSugar = new SugarDecorator(new MilkDecorator(coffee));  
console.log(\`Cost: $${coffeeWithMilkAndSugar.cost()}\`); // $8  
  
const coffeeWithFoam = new FoamDecorator(coffee);  
console.log(\`Cost: $${coffeeWithFoam.cost()}\`); // $8  
  
const deluxeCoffee = new FoamDecorator(new MilkDecorator(new SugarDecorator(coffee)));  
console.log(\`Cost: $${deluxeCoffee.cost()}\`); // $11

```
