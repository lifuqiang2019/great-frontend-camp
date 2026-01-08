# CommonJS 与 ESM （ ECMAScript Modules） 的区别

CommonJS 模块通常用于服务器端（Node.js），在浏览器端需要使用工具进行转译或打包。

ESM （ ECMAScript Modules） 模块是浏览器原生支持的，可以直接在现代浏览器中使用，不需要额外的转译工具。

1.  **加载时机**

- **CommonJS ：** 同步加载，模块在运行时（runtime）加载，并且是按需加载的，只有在需要时才会被加载。
- **ESM ：** 静态加载的，模块在解析时加载，在代码执行之前就被加载，因此具有更早的加载时机。

1.  **依赖关系**

- **CommonJS ：** 模块的依赖关系是动态的，意味着模块可以在运行时根据条件加载不同的依赖。
- **ESM ：** 模块的依赖关系是静态的，依赖关系在模块加载之前就确定，不能根据条件改变依赖关系。

1.  **导出方式**

- **CommonJS ：** 使用 module.exports 来导出模块，可以导出任意类型的值，包括函数、对象、类等。
- **ESM ：** 使用 export 和 import 关键字来导出和导入模块。导出时需要明确指定导出的变量、函数或类，导入时也需要明确指定要导入的内容。

1.  **全局共享**

- **CommonJS ：** 模块在每个模块中都有自己的 作用域 ，不会污染全局作用域。
- **ESM ：** 模块默认是严格模式（strict mode），变量不会污染全局 作用域 ，模块内部的变量不被会提升。

1.  **静态分析**

- **CommonJS ：** 模块的依赖关系无法在编译时 静态分析 ，这对一些工具的性能和优化产生了挑战。
- **ESM ：** 模块的依赖关系可以在编译时进行 静态分析 ，这有助于提高性能和优化。

1.  **案例**

- **CommonJS**

```javascript
// a.js  
module.exports = function greet(name) {  
return \`Hello, ${name}!\`;  
}

```

```javascript
// b.js  
const greet = require('a');  
console.log(greet('John'));

```
- **ESM**

```javascript
// a.js  
export function greet(name) {  
return \`Hello, ${name}!\`;  
}

```

```javascript
// b.js  
import { greet } from './module1.js';  
console.log(greet('John'));

```

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
<meta charset="UTF-8">  
<meta name="viewport" content="width=device-width, initial-scale=1.0">  
<title></title>  
<style type="text/css"></style>  
<script type="module" src="./a.js"></script>  
<script type="module" src="./b.js"></script>  
</head>  
<body>  
</body>  
</html>

CommonJS 和 ESM 都用于模块化 JavaScript ，但它们在加载时机、依赖关系、导出方式、全局 作用域 等方面存在重要的区别。在浏览器端，ESM成为了官方的标准，而在服务器端（Node.js）仍然广泛使用CommonJS。选择哪种模块规范取决于你的项目需求和所支持的环境。 如果需要在浏览器端使用ESM，请确保你的目标浏览器支持它，或者使用工具进行转译。

```
