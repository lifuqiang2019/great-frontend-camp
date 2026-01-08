# 单例模式 （ Singleton Pattern）

保证一个类仅有一个实例，并提供一个全局访问点。

```javascript
const Singleton = (function () {  
let instance;  
  
function createInstance() {  
return new Object("I am the instance");  
}  
  
return {  
getInstance: function () {  
if (!instance) {  
instance = createInstance();  
}  
return instance;  
}  
};  
})();  
  
const instance1 = Singleton.getInstance();  
const instance2 = Singleton.getInstance();  
  
console.log(instance1 === instance2); // true

```
