# 谈谈 computed 的机制，缓存了什么？

- Vue.js 中的 computed 属性确实具有缓存机制，这个缓存机制实际上是指对计算属性的值进行了缓存。当你在模板中多次访问同一个计算属性时，Vue.js只会计算一次这个属性的值，然后将结果缓存起来，以后再次访问时会直接返回缓存的结果，而不会重新计算。
- 假设你有一个计算属性 fullName ，它依赖于 firstName 和 lastName 两个响应式数据。当你在模板中使用 {{ fullName }} 来显示全名时，Vue.js会自动建立依赖关系，并在 firstName 或 lastName 发生变化时，自动更新 fullName 的值，然后将新的值渲染到页面上。
