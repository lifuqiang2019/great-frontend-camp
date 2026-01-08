# 备忘录模式 （ Memento Pattern ）

用于捕获一个对象的内部状态，以便以后可以将该对象恢复到原始状态。

```javascript
// 备忘录：保存文本状态  
class TextMemento {  
constructor(text) {  
this.text = text;  
}  
  
getText() {  
return this.text;  
}  
}  
  
// 原发器：文本编辑器  
class TextEditor {  
constructor() {  
this.text = "";  
}  
  
setText(text) {  
this.text = text;  
}  
  
getText() {  
return this.text;  
}  
  
createMemento() {  
return new TextMemento(this.text);  
}  
  
restoreFromMemento(memento) {  
this.text = memento.getText();  
}  
}  
  
// 管理者：备忘录管理  
class MementoManager {  
constructor() {  
this.mementos = \[\];  
}  
  
addMemento(memento) {  
this.mementos.push(memento);  
}  
  
getMemento(index) {  
return this.mementos\[index\];  
}  
}  
  
// 使用备忘录模式  
const editor = new TextEditor();  
const mementoManager = new MementoManager();  
  
editor.setText("This is the first state.");  
mementoManager.addMemento(editor.createMemento());  
  
editor.setText("This is the second state.");  
mementoManager.addMemento(editor.createMemento());  
  
editor.setText("This is the third state.");  
  
console.log("Current State: " + editor.getText());  
  
// 恢复到第二个状态  
editor.restoreFromMemento(mementoManager.getMemento(1));  
  
console.log("Restored State: " + editor.getText());

```
