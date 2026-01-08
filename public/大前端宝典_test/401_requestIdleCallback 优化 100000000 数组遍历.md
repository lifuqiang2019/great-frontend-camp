# requestIdleCallback 优化 100000000 数组遍历

requestIdleCallback 会在浏览器每帧剩余的空闲时间内执行

```html
<!DOCTYPE html>  
<html>  
<head>  
<title></title>  
<meta charset="utf-8" />  
<style type="text/css">  
.circle {  
width: 300px;  
height: 300px;  
background-color: blue;  
border-radius: 50%;  
position: absolute;  
animation: moveRightLeft 2s infinite alternate;  
}  
@keyframes moveRightLeft {  
from {  
left: 100px;  
}  
to {  
left: 800px;  
}  
}  
</style>  
<script type="text/javascript">  
const len = 100000000;  
const list = \[\];  
const runner = function(deadline) {  
while(deadline.timeRemaining() > 0 && list.length < len) {  
list.push(Date.now());  
}  
if (list.length < len) {  
requestIdleCallback(runner);  
}  
console.log('数组长度:', list.length);  
}  
requestIdleCallback(runner);  
</script>  
</head>  
<body>  
<div class="circle"></div>  
</body>  
</html>

```
