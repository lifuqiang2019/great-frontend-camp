# console.log 被重写，重新获取的方法

```javascript
const iframe = document.createElement('iframe')  
iframe.style.display = 'none'  
document.body.appendChild(iframe)  
console.log = iframe.contentWindow.console.log

```
**Typescript 题目**
