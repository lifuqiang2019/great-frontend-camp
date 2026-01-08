# 建造者模式（Builder Pattern）

用于创建一个复杂对象，将对象的构建过程分解为多个步骤。

```javascript
// Product: 表示要构建的复杂对象  
class Computer {  
constructor() {  
this.cpu = "";  
this.gpu = "";  
this.ram = 0;  
this.storage = "";  
}  
  
describe() {  
return \`Computer with CPU: ${this.cpu}, GPU: ${this.gpu}, RAM: ${this.ram}GB, Storage: ${this.storage}\`;  
}  
}  
  
// Builder: 声明构建复杂对象的接口  
class ComputerBuilder {  
constructor() {  
this.computer = new Computer();  
}  
  
setCPU(cpu) {  
this.computer.cpu = cpu;  
return this;  
}  
  
setGPU(gpu) {  
this.computer.gpu = gpu;  
return this;  
}  
  
setRAM(ram) {  
this.computer.ram = ram;  
return this;  
}  
  
setStorage(storage) {  
this.computer.storage = storage;  
return this;  
}  
  
build() {  
return this.computer;  
}  
}  
  
// Director: 负责使用 Builder 构建对象  
class ComputerEngineer {  
constructComputer(builder) {  
return builder  
.setCPU("Intel i9")  
.setGPU("Nvidia RTX 3080")  
.setRAM(32)  
.setStorage("1TB SSD")  
.build();  
}  
}  
  
// 使用建造者模式创建复杂对象  
const engineer = new ComputerEngineer();  
const builder = new ComputerBuilder();  
  
const highEndComputer = engineer.constructComputer(builder);  
const midRangeComputer = builder.setCPU("AMD Ryzen 7").setRAM(16).build();  
  
console.log(highEndComputer.describe());  
console.log(midRangeComputer.describe());

```
