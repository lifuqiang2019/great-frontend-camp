# Function Calling 原理流程

1.  开发者向模型注册函数定义（名称、参数 schema）。

YAML  
functions: \[{  
name: "getWeather",  
parameters: {  
type: "object",  
properties: { city: { type: "string" } },  
required: \["city"\]  
}  
}\]

1.  模型推理后生成结构化 JSON（指明要调用哪个函数、参数是什么）。

```javascript
{  
"name": "getWeather",  
"arguments": { "city": "Guangzhou" }  
}

1.  开发者执行该函数，并把结果返回给模型，模型再继续生成答案。

```

```javascript
const result = getWeather("Guangzhou")

```
