# 弹性盒子 flex 布局

Flex 布局的核心概念包括以下几点：

- **容器和项：** 在 Flex 布局中，存在容器元素和容器内的项（子元素）。容器元素通过设置 display: flex; 或 display: inline-flex; 来启用 Flex 布局。
- **主轴和 交叉轴 ：** Flex 布局定义了主轴和交叉轴。主轴是项排列的主要方向，而交叉轴是垂直于主轴的方向。
- **弹性布局：** Flex 布局允许项根据可用空间自动调整大小，以填充容器。这意味着项可以具有弹性的宽度或高度，以适应不同屏幕尺寸。
- **对齐和排序：** 您可以轻松地控制项在主轴和 交叉轴 上的对齐方式，以及它们的排序顺序。
- **自动换行：** 如果项在主轴上无法适应容器的宽度，它们可以自动换行到下一行，而无需使用浮动布局。
- **嵌套支持：** 您可以嵌套多个 Flex 容器以创建复杂的布局结构。

```html
<html>  
<head>  
<style type="text/css">  
.container {  
display: flex; /\* 设置容器为 Flexbox 布局 \*/  
justify-content: center; /\* 在主轴上居中对齐 \*/  
}  
  
.menu {  
display: flex; /\* 设置菜单为 Flexbox 布局 \*/  
}  
  
.menu a {  
margin: 10px; /\* 项之间的间距 \*/  
padding: 10px;  
text-decoration: none;  
color: #333;  
background-color: #f0f0f0;  
}  
</style>  
</head>  
<body>  
<div class="container">  
<nav class="menu">  
<a href="#">首页</a>  
<a href="#">关于我们</a>  
<a href="#">产品</a>  
<a href="#">联系我们</a>  
</nav>  
</div>  
</body>  
</html>

```
