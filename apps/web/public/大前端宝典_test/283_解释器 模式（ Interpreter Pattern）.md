# 解释器 模式（ Interpreter Pattern）

用于解释语言中的句子，通常用于编译器和 解释器 的开发。

```javascript
// 抽象表达式：规则解释器  
class RuleExpression {  
interpret(context) {  
throw new Error("Subclasses must implement interpret(context) method");  
}  
}  
  
// 具体表达式：规则解释器，解释 "AND" 规则  
class AndExpression extends RuleExpression {  
constructor(expression1, expression2) {  
super();  
this.expression1 = expression1;  
this.expression2 = expression2;  
}  
  
interpret(context) {  
return this.expression1.interpret(context) && this.expression2.interpret(context);  
}  
}  
  
// 具体表达式：规则解释器，解释 "OR" 规则  
class OrExpression extends RuleExpression {  
constructor(expression1, expression2) {  
super();  
this.expression1 = expression1;  
this.expression2 = expression2;  
}  
  
interpret(context) {  
return this.expression1.interpret(context) || this.expression2.interpret(context);  
}  
}  
  
// 具体表达式：规则解释器，解释 "NOT" 规则  
class NotExpression extends RuleExpression {  
constructor(expression) {  
super();  
this.expression = expression;  
}  
  
interpret(context) {  
return !this.expression.interpret(context);  
}  
}  
  
// 上下文类：规则上下文  
class RuleContext {  
constructor(data) {  
this.data = data;  
}  
  
getData(key) {  
return this.data\[key\];  
}  
}  
  
// 使用解释器模式  
const context = new RuleContext({  
A: true,  
B: false,  
C: true  
});  
  
const rule1 = new AndExpression(new OrExpression(new NotExpression(new AndExpression(context.getData('A'), context.getData('B'))), context.getData('C')), context.getData('B'));  
  
console.log("Rule Evaluation: " + rule1.interpret(context));

```
