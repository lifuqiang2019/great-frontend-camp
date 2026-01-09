# Vue-Router 3.x hash模式 与 history模式 的区别

**Hash 模式（默认）：** 利用 #号使用 hash 来模拟一个完整的 URL，如： http://xxx.com/#/path/to/route 。

**History 模式：** 利用了 HTML5 History Interface 中新增的 pushState() 和 replaceState() 方法来完成 URL 跳转而无须重新加载页面。服务端增加一个覆盖所有情况的候选页面，如果 URL 匹配不到任何资源，则返回这个页面。

```javascript
const router = new VueRouter({  
mode: 'history', // 路由模式配置  
routes: \[  
{ path: '/', component: Home },  
{ path: '/about', component: About }  
\]  
});

```
