# 状态模式 （State Pattern）

允许对象在内部状态改变时改变它的行为。

```javascript
// 抽象状态类  
class DocumentState {  
constructor(document) {  
this.document = document;  
}  
  
edit() {  
throw new Error("This operation is not supported in the current state");  
}  
  
review() {  
throw new Error("This operation is not supported in the current state");  
}  
  
publish() {  
throw new Error("This operation is not supported in the current state");  
}  
}  
  
// 具体状态类：草稿状态  
class DraftState extends DocumentState {  
edit() {  
console.log("Editing the document");  
this.document.setState(new DraftState());  
}  
  
review() {  
console.log("Reviewing the document");  
this.document.setState(new ReviewState());  
}  
  
publish() {  
console.log("Cannot publish the document in draft state");  
}  
}  
  
// 具体状态类：待审核状态  
class ReviewState extends DocumentState {  
edit() {  
console.log("Cannot edit the document in review state");  
}  
  
review() {  
console.log("Document is already under review");  
}  
  
publish() {  
console.log("Publishing the document");  
this.document.setState(new PublishedState());  
}  
}  
  
// 具体状态类：已发布状态  
class PublishedState extends DocumentState {  
edit() {  
console.log("Cannot edit the document in published state");  
}  
  
review() {  
console.log("Cannot review the document in published state");  
}  
  
publish() {  
console.log("Document is already published");  
}  
}  
  
// 上下文类  
class Document {  
constructor() {  
this.state = new DraftState(this);  
}  
  
setState(state) {  
this.state = state;  
}  
  
edit() {  
this.state.edit();  
}  
  
review() {  
this.state.review();  
}  
  
publish() {  
this.state.publish();  
}  
}  
  
// 使用状态模式  
const document = new Document();  
  
document.edit();  
document.review();  
document.publish();  
  
document.edit(); // 此时已经发布，无法编辑

```
