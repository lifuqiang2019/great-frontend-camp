# 策略模式（Strategy Pattern）

定义一系列算法，将它们封装起来，并使它们可以相互替换。

```javascript
// 策略接口  
class MathOperation {  
calculate(a, b) {}  
}  
  
// 具体策略：加法  
class AdditionOperation extends MathOperation {  
calculate(a, b) {  
return a + b;  
}  
}  
  
// 具体策略：减法  
class SubtractionOperation extends MathOperation {  
calculate(a, b) {  
return a - b;  
}  
}  
  
// 具体策略：乘法  
class MultiplicationOperation extends MathOperation {  
calculate(a, b) {  
return a \* b;  
}  
}  
  
// 上下文  
class Calculator {  
constructor(mathOperation) {  
this.mathOperation = mathOperation;  
}  
  
setMathOperation(mathOperation) {  
this.mathOperation = mathOperation;  
}  
  
executeOperation(a, b) {  
return this.mathOperation.calculate(a, b);  
}  
}  
  
// 使用策略模式  
const calculator = new Calculator(new AdditionOperation());  
  
console.log("Addition: " + calculator.executeOperation(5, 3));  
  
calculator.setMathOperation(new SubtractionOperation());  
console.log("Subtraction: " + calculator.executeOperation(5, 3));  
  
calculator.setMathOperation(new MultiplicationOperation());  
console.log("Multiplication: " + calculator.executeOperation(5, 3));

```
