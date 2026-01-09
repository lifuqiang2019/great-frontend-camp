# 相对布局和绝对布局，position:relative 和 absolute 。

- **相对布局（Relative Positioning）：**
- 使用 position: relative; 将元素的位置相对于其自身在正常文档流中的位置进行调整。
- 相对布局会保留元素原有的空间，但可以通过 top 、 right 、 bottom 和 left 属性来调整元素的位置，使其相对于原始位置上下左右偏移。

```html
<html>  
<head>  
<style type="text/css">  
.container {  
position: relative; /\* 用于相对定位的父元素 \*/  
width: 300px;  
height: 200px;  
background-color: #ccc;  
}  
  
.relative-element {  
position: relative;  
top: 20px; /\* 相对于原始位置向下偏移20px \*/  
left: 30px; /\* 相对于原始位置向右偏移30px \*/  
background-color: #f00;  
}  
</style>  
</head>  
<body>  
<div class="container">  
<div class="relative-element">相对定位元素</div>  
</div>  
</body>  
</html>

```
- **绝对布局（Absolute Positioning）：**
- 使用 position: absolute; 将元素的位置相对于其最近的具有相对定位或绝对定位的父元素进行调整。
- 绝对布局会使元素脱离正常文档流，不保留原有的空间，因此不会影响其他元素的位置。

```html
<html>  
<head>  
<style type="text/css">  
.container {  
position: relative; /\* 用于相对定位的父元素 \*/  
width: 300px;  
height: 200px;  
background-color: #ccc;  
}  
  
.absolute-element {  
position: absolute;  
top: 50px; /\* 相对于父元素的顶部偏移50px \*/  
left: 100px; /\* 相对于父元素的左侧偏移100px \*/  
background-color: #f00;  
}  
</style>  
</head>  
<body>  
<div class="container">  
<div class="absolute-element">绝对定位元素</div>  
</div>  
</body>  
</html>

在绝对定位中，通常需要指定元素相对于哪个父元素进行定位，这可以通过为父元素添加 position: relative; 来实现。如果没有明确的相对定位的父元素，绝对定位将相对于文档的根元素进行定位。

```
