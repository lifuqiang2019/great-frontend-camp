# 桥接模式 （ Bridge Pattern）

分离抽象部分和实现部分，使它们可以独立变化。

```javascript
// 抽象实现部分：设备  
class Device {  
constructor() {  
this.state = "off";  
}  
  
turnOn() {  
this.state = "on";  
}  
  
turnOff() {  
this.state = "off";  
}  
  
getDeviceState() {  
return this.state;  
}  
}  
  
// 具体实现部分：电视  
class TV extends Device {  
turnOn() {  
console.log("TV is on");  
super.turnOn();  
}  
  
turnOff() {  
console.log("TV is off");  
super.turnOff();  
}  
}  
  
// 具体实现部分：音响  
class Stereo extends Device {  
turnOn() {  
console.log("Stereo is on");  
super.turnOn();  
}  
  
turnOff() {  
console.log("Stereo is off");  
super.turnOff();  
}  
}  
  
// 抽象部分：遥控器  
class RemoteControl {  
constructor(device) {  
this.device = device;  
}  
  
togglePower() {  
if (this.device.getDeviceState() === "on") {  
this.device.turnOff();  
} else {  
this.device.turnOn();  
}  
}  
}  
  
// 使用桥接模式  
const tv = new TV();  
const stereo = new Stereo();  
  
const remote1 = new RemoteControl(tv);  
const remote2 = new RemoteControl(stereo);  
  
remote1.togglePower(); // 打开电视  
remote2.togglePower(); // 打开音响  
remote1.togglePower(); // 关闭电视  
remote2.togglePower(); // 关闭音响

```
