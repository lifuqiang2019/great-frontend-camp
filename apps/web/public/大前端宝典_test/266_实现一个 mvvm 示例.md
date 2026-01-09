# 实现一个 mvvm 示例

```html
<!-- MVVM  
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
