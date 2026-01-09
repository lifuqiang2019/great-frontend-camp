# transition 和 animation 的区别？

transition 和 animation 是 CSS 用于创建动画效果的两种不同的属性。

**Transition（过渡）：**

- transition 允许元素在状态改变时平滑地过渡到新的样式。它可应用于元素各属性，如颜色、尺寸、位置等。
- 过渡是由触发状态变化的事件触发的，比如鼠标悬停、焦点获得、类名变化等。
- 过渡通常使用简单的语法定义，包括要过渡的属性、过渡持续时间、过渡的时间函数和延迟时间。
- 过渡通常是在元素的常规和 伪类 状态之间进行切换，例如 hover 、 focus 。

```css
  
.button {  
transition: background-color 0.3s ease;  
}  
  
.button:hover {  
background-color: #ff0000;  
}

```
**Animation（动画）：**

- animation 允许您创建更复杂的动画，它可以定义关键帧，以便在动画的不同阶段应用不同的样式。
- 动画是在元素的状态、时间轴或事件触发下进行的。
- 动画可以更精细地控制动画的每一帧，包括持续时间、循环次数、缓动函数等。
- 动画通常用于创建更复杂的动画序列，可以包括多个关键帧和自定义时间函数。

```css
@keyframes slide {  
0% { transform: translateX(0); }  
50% { transform: translateX(100px); }  
100% { transform: translateX(200px); }  
}  
  
.slide {  
animation: slide 2s linear infinite;  
}

```
**总结：**

- 使用 transition 可以创建简单的状态过渡效果，适用于鼠标悬停、焦点等触发的状态变化。
- 使用 animation 可以创建更复杂的动画，包括关键帧、持续时间、循环和更精细的控制。它适用于需要更多控制和复杂度的动画场景。
