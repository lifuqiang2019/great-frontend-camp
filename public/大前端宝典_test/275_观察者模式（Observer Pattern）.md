# 观察者模式（Observer Pattern）

定义了对象之间的一对多依赖，当一个对象状态改变时，所有依赖它的对象都会收到通知。

```javascript
// 主题（Subject）对象  
class Subject {  
constructor() {  
this.observers = \[\];  
}  
  
// 注册观察者  
addObserver(observer) {  
this.observers.push(observer);  
}  
  
// 移除观察者  
removeObserver(observer) {  
const index = this.observers.indexOf(observer);  
if (index !== -1) {  
this.observers.splice(index, 1);  
}  
}  
  
// 通知观察者  
notify(message) {  
this.observers.forEach(observer => {  
observer.update(message);  
});  
}  
}  
  
// 观察者（Observer）对象  
class Observer {  
constructor(name) {  
this.name = name;  
}  
  
update(message) {  
console.log(\`${this.name} received message: ${message}\`);  
}  
}  
  
// 客户端代码  
const subject = new Subject();  
  
const observer1 = new Observer("Observer 1");  
const observer2 = new Observer("Observer 2");  
const observer3 = new Observer("Observer 3");  
  
subject.addObserver(observer1);  
subject.addObserver(observer2);  
subject.addObserver(observer3);  
  
subject.notify("Hello, observers!");  
  
subject.removeObserver(observer2);  
  
subject.notify("Observer 2 has been removed.");

```
