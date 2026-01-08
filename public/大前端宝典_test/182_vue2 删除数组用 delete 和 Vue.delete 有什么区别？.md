# vue2 删除数组用 delete 和 Vue.delete 有什么区别？

**delete** **：**

- delete 是 JavaScript 的原生操作符，用于删除对象的属性。当你使用 delete 删除数组的元素时，元素确实会被删除，但数组的长度不会改变，被删除的元素将变成 undefined 。
- delete 操作不会触发Vue的响应系统，因此不会引起视图的更新。

```javascript
const arr = \[1, 2, 3\];  
delete arr\[1\]; // 删除元素2  
// 现在 arr 变成 \[1, empty, 3\]

```
**Vue.delete** **：**

- Vue.delete 是Vue 2提供的用于在响应式数组中删除元素的方法。它会将数组的长度缩短，并触发Vue的响应系统，确保视图与数据同步。
- 使用 Vue.delete 来删除数组元素，Vue会正确追踪更改，并在视图中删除相应的元素。

```javascript
const arr = \[1, 2, 3\];  
Vue.delete(arr, 1); // 删除元素2  
// 现在 arr 变成 \[1, 3\]

```
