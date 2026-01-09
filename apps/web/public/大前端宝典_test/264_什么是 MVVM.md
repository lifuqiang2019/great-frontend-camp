# 什么是 MVVM

MVVM（Model-View-ViewModel）是一种用于构建用户界面的软件架构模式。它是一种分离关注点的模式，旨在使用户界面的开发更加模块化、可维护和可测试，

**包括：**

- **Model：** 代表应用程序的数据和业务逻辑。模型负责管理数据的状态和操作，但不关心数据的展示方式。
- **View：** 代表用户界面。视图负责数据的展示和用户输入的处理，但不应包含业务逻辑。
- **ViewModel：** ViewModel 充当了模型和视图之间的中介。它包含了视图所需的数据和命令，以及处理视图和模型之间的数据交互。ViewModel 可以将模型数据适配成视图所需的形式，同时也可以监听视图的用户输入并将其转发到模型。

**优点：**

- **分离关注点：** MVVM 通过将关注点分离，使代码更加模块化，每个部分都可以独立开发和测试。
- **可维护性：** 由于分离了模型、视图和视图模型，更容易对每个部分进行维护，而不会对其他部分造成影响。
- **可测试性：** 由于视图模型可以独立于视图进行测试，因此更容易编写单元测试。
- **数据绑定：** MVVM 常常与数据绑定库结合使用，使视图与视图模型之间的数据同步更加简单和高效。

```html
<!--  
MVVM  
M：model: 数据层  
V：view: 视图层  
VM：viewModel: 逻辑层  
\-->  
  
<!DOCTYPE html>  
<html>  
<head>  
<title></title>  
</head>  
<body>  
<!-- View -->  
<input id="input" />  
<div id="content"></div>  
</body>  
<script type="text/javascript">  
window.onload = () => {  
// Model 层  
const data = {  
inputVal: ''  
};  
  
// ViewModel 层  
  
// 视图 -> 数据  
const input = document.getElementById('input');  
input.addEventListener('input', (e) => {  
proxy.inputVal = input.value;  
})  
  
// 数据 -> 视图  
const proxy = new Proxy(data, {  
set: (target, key, value) => {  
if (key === 'inputVal') {  
const content = document.getElementById('content');  
content.innerHTML = value;  
}  
}  
});  
  
// Object.defineProperty(data, 'inputVal', {  
// set: (value) => {  
// document.getElementById('content').innerHTML = value;  
// }  
// })  
}  
</script>  
</html>

```
- **视图到数据的同步：** 当用户在输入框中输入文本时， v-model 监听到输入事件（通常是 input 事件）并捕获用户的输入。然后，它将用户的输入值自动反映到绑定的数据属性中，确保视图和数据保持同步。
- **数据到视图的同步：** 如果你在代码中更新了与 v-model 绑定的数据属性，Vue.js 会自动将这个新的值反映到视图中。这确保了数据和视图之间的双向同步。Vue2 用 Object.defineProperty，Vue3 用 new Proxy()。
