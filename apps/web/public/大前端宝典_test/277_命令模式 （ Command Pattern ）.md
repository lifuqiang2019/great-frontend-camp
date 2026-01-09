# 命令模式 （ Command Pattern ）

将一个操作请求封装为一个对象，从而可以参数化客户端队操作请求进行排队、记录请求日志、撤销等操作。

```javascript
// 接收者：电视  
class Television {  
turnOn() {  
console.log("TV is on");  
}  
  
turnOff() {  
console.log("TV is off");  
}  
}  
  
// 接收者：音响  
class Stereo {  
turnOn() {  
console.log("Stereo is on");  
}  
  
turnOff() {  
console.log("Stereo is off");  
}  
}  
  
// 抽象命令  
class Command {  
execute() {}  
}  
  
// 具体命令：打开电视  
class TurnOnTVCommand extends Command {  
constructor(television) {  
super();  
this.television = television;  
}  
  
execute() {  
this.television.turnOn();  
}  
}  
  
// 具体命令：关闭电视  
class TurnOffTVCommand extends Command {  
constructor(television) {  
super();  
this.television = television;  
}  
  
execute() {  
this.television.turnOff();  
}  
}  
  
// 具体命令：打开音响  
class TurnOnStereoCommand extends Command {  
constructor(stereo) {  
super();  
this.stereo = stereo;  
}  
  
execute() {  
this.stereo.turnOn();  
}  
}  
  
// 具体命令：关闭音响  
class TurnOffStereoCommand extends Command {  
constructor(stereo) {  
super();  
this.stereo = stereo;  
}  
  
execute() {  
this.stereo.turnOff();  
}  
}  
  
// 调用者：遥控器  
class RemoteControl {  
constructor() {  
this.command = null;  
}  
  
setCommand(command) {  
this.command = command;  
}  
  
pressButton() {  
this.command.execute();  
}  
}  
  
// 使用命令模式  
const tv = new Television();  
const stereo = new Stereo();  
  
const turnOnTV = new TurnOnTVCommand(tv);  
const turnOffTV = new TurnOffTVCommand(tv);  
const turnOnStereo = new TurnOnStereoCommand(stereo);  
const turnOffStereo = new TurnOffStereoCommand(stereo);  
  
const remote = new RemoteControl();  
  
remote.setCommand(turnOnTV);  
remote.pressButton();  
  
remote.setCommand(turnOnStereo);  
remote.pressButton();  
  
remote.setCommand(turnOffTV);  
remote.pressButton();  
  
remote.setCommand(turnOffStereo);  
remote.pressButton();

```
