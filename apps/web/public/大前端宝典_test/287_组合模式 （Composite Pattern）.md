# 组合模式 （Composite Pattern）

用于将对象组合成树状结构，以表示部分-整体层次结构。

```javascript
// 抽象组件：组织  
class OrganizationComponent {  
constructor(name) {  
this.name = name;  
}  
  
add(component) {  
throw new Error("This operation is not supported");  
}  
  
remove(component) {  
throw new Error("This operation is not supported");  
}  
  
display(indent = 0) {  
console.log(" ".repeat(indent) + this.name);  
}  
}  
  
// 叶子组件：部门  
class Department extends OrganizationComponent {  
display(indent = 0) {  
super.display(indent);  
}  
}  
  
// 容器组件：公司  
class Company extends OrganizationComponent {  
constructor(name) {  
super(name);  
this.subcomponents = \[\];  
}  
  
add(component) {  
this.subcomponents.push(component);  
}  
  
remove(component) {  
const index = this.subcomponents.indexOf(component);  
if (index !== -1) {  
this.subcomponents.splice(index, 1);  
}  
}  
  
display(indent = 0) {  
super.display(indent);  
for (const component of this.subcomponents) {  
component.display(indent + 4);  
}  
}  
}  
  
// 使用组合模式  
const root = new Company("ABC Corporation");  
  
const department1 = new Department("Finance Department");  
const department2 = new Department("Engineering Department");  
  
root.add(department1);  
root.add(department2);  
  
const subDepartment1 = new Department("Sub-Finance Department");  
department1.add(subDepartment1);  
  
console.log("Organization Structure:");  
root.display();  
  
// 输出：  
// ABC Corporation  
// Finance Department  
// Sub-Finance Department  
// Engineering Department

```
