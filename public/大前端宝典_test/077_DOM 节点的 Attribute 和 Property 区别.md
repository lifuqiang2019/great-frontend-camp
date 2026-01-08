# DOM 节点的 Attribute 和 Property 区别

**Attribute（属性）：**

- Attribute 是 HTML 元素在文档中的属性，它们通常在 HTML 中定义，并被存储在 HTML 元素的开始标签中。
- Attribute 可以包含在 HTML 中，如 <div id="myDiv" class="container"> 中的 id 和 class 。
- Attribute 始终是字符串值，无论它们在 HTML 中是什么 数据类型 。
- 通过 getAttribute() 方法可以访问元素的属性值，例如 element.getAttribute("id") 。

**Property（属性）：**

- Property 是 DOM 元素对象的属性，它们通常表示了 HTML 元素在文档中的状态和属性。
- Property 的名称通常对应于 HTML 元素的属性名称，但不总是相同（有时有所不同）。
- Property 的值可以是不同的 数据类型 ，取决于属性的类型。
- 通过访问 DOM 元素对象的属性，可以直接操作和修改元素的状态，例如 element.id 或 element.className 。

**总结：**

- Attribute 是 HTML 标记中的属性，它们以字符串形式存储在 HTML 元素的标记中。
- Property 是 DOM 元素对象的属性，它们表示了元素在文档中的状态和属性，可以是不同的 数据类型 。
- Attribute 始终是字符串，而 Property 的 数据类型 可以更广泛。
- 通常，Property 的名称与 Attribute 的名称相同，但不总是一致。

**案例：**

```html
<div id="myDiv" class="container"></div>

```
- id 和 class 是 Attribute，它们以字符串形式存储在 HTML 标记中。
- id 和 className 是 Property，它们是 DOM 元素对象的属性，可以直接访问和操作。
