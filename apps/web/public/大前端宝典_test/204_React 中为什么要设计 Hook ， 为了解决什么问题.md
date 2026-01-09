# React 中为什么要设计 Hook ， 为了解决什么问题

总的来说是以下三个原因：

- Component 非 UI 逻辑复用困难。
- 组件的生命 周期函数 不适合 side effect 逻辑的管理。
- 不友好的 Class Component。
