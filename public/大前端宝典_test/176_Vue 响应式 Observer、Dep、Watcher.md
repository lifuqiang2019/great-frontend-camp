# Vue 响应式 Observer、Dep、Watcher

Vue 响应式原理的核心就是 Observer 、 Dep 、 Watcher 。

Observer 中进行响应式的绑定，

在数据被读的时候，触发 get 方法，执行 Dep 来收集依赖，也就是收集 Watcher 。

在数据被改的时候，触发 set 方法，通过对应的所有依赖( Watcher )，去执行更新。

**vue2:** vue2/src/core/observer

**vue3:** vue3/packages/reactivity
