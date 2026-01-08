# vue3 为什么要用 proxy 替换 Object.defineproperty ？

Vue 3 在设计上选择使用 Proxy 替代 Object.defineProperty 主要是为了提供更好的响应性和性能。

Object.defineProperty 是在 ES5 中引入的属性定义方法，用于对对象的属性进行劫持和拦截。Vue 2.x 使用 Object.defineProperty 来实现对数据的劫持，从而实现响应式数据的更新和依赖追踪。

- Object.defineProperty 只能对已经存在的属性进行劫持，无法拦截新增的属性和删除的属性。这就意味着在 Vue 2.x 中，当你添加或删除属性时，需要使用特定的方法( Vue.set 和 Vue.delete )来通知 Vue 响应式系统进行更新。这种限制增加了开发的复杂性。
- Object.defineProperty 的劫持是基于属性级别的，也就是说每个属性都需要被劫持。这对于大规模的对象或数组来说，会导致性能下降。因为每个属性都需要添加劫持逻辑，这会增加 内存 消耗和初始化时间。
- 相比之下， Proxy 是 ES6 中引入的 元编程 特性，可以对整个对象进行拦截和代理。 Proxy 提供了更强大和灵活的拦截能力，可以拦截对象的读取、赋值、删除等操作。Vue 3.x 利用 Proxy 的特性，可以更方便地实现响应式系统。
- 使用 Proxy 可以解决 Object.defineProperty 的限制问题。它可以直接拦截对象的读取和赋值操作，无需在每个属性上进行劫持。这样就消除了属性级别的劫持开销，提高了初始化性能。另外， Proxy 还可以拦截新增属性和删除属性的操作，使得响应式系统更加完备和自动化。
