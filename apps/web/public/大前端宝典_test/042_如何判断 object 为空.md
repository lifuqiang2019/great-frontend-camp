# 如何判断 object 为空

- 常用方法：
- Object.keys(obj).length === 0
- JSON.stringify(obj) === '{}'
- for in 判断
- 以上方法都是不太严谨，因为处理不了 const obj = { \[Symbol('a')\]: 1 }. 这种情况
- 更严谨的方法： Reflect.ownKeys(obj).length === 0;
