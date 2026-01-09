# 类组件(Class component) 和 函数式组件(Functional component) 区别

**类组件（Class component）：**

- 通过 继承 React.Component类来定义组件。
- 可以包含自己的状态（state）和生命周期方法（lifecycle methods）。
- 可以使用this关键字来访问组件的状态和props。
- 可以使用 ref 来访问 DOM 元素或子组件。
- 可以使用setState方法来更新组件的状态，触发组件的重新渲染。
- 通常用于复杂的组件，需要管理自己的状态并响应生命周期事件。

**函数式组件（Functional component）：**

- 通过函数来定义组件，接收props作为参数，返回 JSX 元素。
- 没有自己的状态和生命周期方法。
- 不能使用this关键字来访问组件的状态和props。
- 通常用于简单的展示组件，只关注 UI 的呈现和展示，不需要管理状态和响应生命周期事件。
