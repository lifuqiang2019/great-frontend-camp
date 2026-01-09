# 适配器模式 （ Adapter Pattern ）

用于兼容不同接口或类之间的不 兼容性 。

```javascript
// 旧的接口  
class OldSystem {  
specificRequest() {  
return "Old System is handling the request.";  
}  
}  
  
// 新的接口（目标接口）  
class NewSystem {  
request() {  
return "New System is handling the request.";  
}  
}  
  
// 适配器  
class Adapter {  
constructor() {  
this.oldSystem = new OldSystem();  
}  
  
request() {  
const specificResult = this.oldSystem.specificRequest();  
// 适配旧接口到新接口  
return \`Adapter: ${specificResult}\`;  
}  
}  
  
// 客户端代码  
function clientCode(system) {  
console.log(system.request());  
}  
  
const newSystem = new NewSystem();  
const adapter = new Adapter();  
  
console.log("Client code is calling the New System:");  
clientCode(newSystem);  
  
console.log("\\nClient code is calling the Adapter (Old System):");  
clientCode(adapter);

```
