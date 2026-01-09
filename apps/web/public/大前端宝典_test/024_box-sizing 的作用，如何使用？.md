# box-sizing 的作用，如何使用？

box-sizing 是一个 CSS 属性，用于控制元素的盒模型如何计算尺寸。它有两个主要取值：

- content-box（默认值） ：元素的宽度和高度只包括内容区域，不包括内边距和边框。这是传统的盒模型。
- border-box ：元素的宽度和高度包括内容区域、内边距和边框。这意味着设置元素的宽度和高度时，内边距和边框不会增加元素的总宽度和高度，而会占用内容区域内的空间。

```css
/\* 使用border-box盒模型 \*_/_  
_.element {  
box-sizing: border-box;  
width: 100px;  
padding: 10px;  
border: 2px solid #000;  
}  
  
/\*_ 使用content-box盒模型 \*/  
.element {  
box-sizing: content-box;  
width: 100px;  
padding: 10px;  
border: 2px solid #000;  
}

在上述示例中，当 box-sizing 设置为 border-box 时，设置的宽度值（100 px ）包括了内边距和边框，而内容区域的宽度会自动减少以适应内边距和边框。这可以帮助更精确地控制元素的总宽度。

**注意：** box-sizing 通常在全局样式中设置，以确保整个页面使用一致的盒模型。

```
