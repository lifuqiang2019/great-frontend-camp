# 写一个 loader

```javascript
// 1. 导出一个函数，该函数接收源代码作为参数  
module.exports = function (source) {  
// 2. 执行你的转换逻辑  
// 这里我们使用正则表达式将所有的console.log语句替换为空字符串  
const modifiedSource = source.replace(/console\\.log\\(.+?\\);/g, '');  
// 3. 返回转换后的源代码  
return modifiedSource;  
};

```
**引用：webpack 配置**

```javascript
module.exports = {  
// 其他配置...  
module: {  
rules: \[  
{  
test: /\\.js$/, // 匹配.js文件  
use: 'my-console-log-loader', // 指定自定义的Loader  
},  
\],  
},  
};

```
