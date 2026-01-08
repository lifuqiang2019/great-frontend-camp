# watch 怎么深度监听对象变化

设置 deep: true 来启用深度监听

```javascript
watch: {  
myObject: {  
handler(newVal, oldVal) {  
console.log('对象发生变化');  
},  
deep: true, // 设置 deep 为 true 表示深度监听  
}  
}

```
