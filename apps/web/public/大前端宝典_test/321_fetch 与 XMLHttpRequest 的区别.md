# fetch 与 XMLHttpRequest 的区别

- **API 设计：**
- XMLHttpRequest 是早期的技术，它使用 回调函数 来处理请求和响应，使其代码结构相对复杂。
- Fetch API 使用基于 Promise 的 API，更现代、直观和易于使用。它支持使用 async/await 来处理异步操作，使代码更清晰。
- **语法：**
- XMLHttpRequest 使用了一种事件驱动的编程模型，通过设置 回调函数 来处理请求的各个阶段，如 onload 、 onerror 、 onreadystatechange 等。
- Fetch API 使用 Promise 对象，通过链式的 .then() 和 .catch() 方法来处理请求和响应。这种方式更容易理解和维护。
- **请求和响应：**
- XMLHttpRequest 使用单独的对象来表示请求和响应，你需要分别创建 XMLHttpRequest 对象和 XMLHttpResponse 对象。
- Fetch API 使用 Request 和 Response 对象，更一致和易于操作，这两种对象都遵循同样的标准。
- **跨域请求：**
- XMLHttpRequest 需要在服务器端进行额外的配置来处理跨域请求，而且在某些情况下，需要使用 JSONP 等技巧来绕过 同源策略 。
- Fetch API 默认支持跨域请求，可以通过 CORS 头部来控制跨域访问。
- **错误处理：**
- XMLHttpRequest 的错误处理通常涉及检查 status 和 readyState 属性，以及使用 回调函数 来处理错误情况。
- Fetch API 使用 Promise 链中的 .catch() 方法来处理错误，这使错误处理更一致和清晰。
- **取消请求：**
- XMLHttpRequest 不提供原生的取消请求的机制，但你可以通过中断请求来模拟取消。
- Fetch API 支持 AbortController 对象，用于取消请求。
