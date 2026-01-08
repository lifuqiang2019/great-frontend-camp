# 写一个 Plugin

```javascript
class BundleReportPlugin {  
constructor(options) {  
this.options = options || {};  
}  
  
apply(compiler) {  
compiler.hooks.emit.tapAsync('BundleReportPlugin', (compilation, callback) => {  
const timestamp = new Date().toLocaleString();  
const moduleCount = Object.keys(compilation.modules).length;  
  
const reportContent = \`Bundle Report - ${timestamp}\\nTotal Modules: ${moduleCount}\`;  
  
compilation.assets\['bundle-report.txt'\] = {  
source: () => reportContent,  
size: () => reportContent.length,  
};  
  
callback();  
});  
}  
}  
  
module.exports = BundleReportPlugin;

```
**引用：webpack 配置**

```javascript
const BundleReportPlugin = require('./BundleReportPlugin');  
  
module.exports = {  
// 其他配置...  
plugins: \[  
new BundleReportPlugin(),  
\],  
};

```
