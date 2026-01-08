# 责任链模式 （ Chain of Responsibility Pattern）

使多个对象都有机会处理请求，将这些对象链接在一起，以便依次处理请求。

```javascript
// 抽象处理者：审批者  
class Approver {  
constructor(name) {  
this.name = name;  
this.nextApprover = null;  
}  
  
setNextApprover(approver) {  
this.nextApprover = approver;  
}  
  
approveRequest(amount) {  
if (this.canApprove(amount)) {  
this.processRequest(amount);  
} else if (this.nextApprover) {  
this.nextApprover.approveRequest(amount);  
} else {  
console.log(\`Request cannot be approved. No more Approvers.\`);  
}  
}  
  
canApprove(amount) {  
return false;  
}  
  
processRequest(amount) {  
console.log(\`${this.name} has approved the request for $${amount}\`);  
}  
}  
  
// 具体处理者：主管  
class Supervisor extends Approver {  
canApprove(amount) {  
return amount <= 1000;  
}  
}  
  
// 具体处理者：经理  
class Manager extends Approver {  
canApprove(amount) {  
return amount <= 5000;  
}  
}  
  
// 具体处理者：总经理  
class GeneralManager extends Approver {  
canApprove(amount) {  
return true;  
}  
}  
  
// 使用责任链模式  
const supervisor = new Supervisor("Supervisor");  
const manager = new Manager("Manager");  
const generalManager = new GeneralManager("General Manager");  
  
supervisor.setNextApprover(manager);  
manager.setNextApprover(generalManager);  
  
supervisor.approveRequest(800);  
supervisor.approveRequest(3000);  
supervisor.approveRequest(10000);  
  
// 输出：  
// Supervisor has approved the request for $800  
// Manager has approved the request for $3000  
// General Manager has approved the request for $10000

```
