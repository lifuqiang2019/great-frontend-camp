# document.write 和 innerHTML 的区别？

1.  **输出位置：**

- document.write ： document.write 方法将内容直接写入到页面的当前位置，它会覆盖已存在的内容。如果它在页面加载后调用，它会覆盖整个页面内容，因此通常不建议在文档加载后使用它。
- innerHTML ： innerHTML 是 DOM 元素的属性，可以用来设置或获取元素的 HTML 内容。它可以用于特定元素，而不会覆盖整个页面。

1.  **用法：**

- document.write ：通常用于在页面加载过程中动态生成 HTML 内容。它是一种旧的、不太推荐的方法，因为它可能导致页面结构混乱，不易维护。
- innerHTML ：通常用于通过 JavaScript 动态更改特定元素的内容。它更加灵活，允许您以更精确的方式操作 DOM 。

1.  **DOM 操作：**

- document.write ：不是 DOM 操作，它仅用于输出文本到页面。
- innerHTML ：是 DOM 操作，允许您操作特定元素的内容，包括添加、删除和替换元素的 HTML 内容。
