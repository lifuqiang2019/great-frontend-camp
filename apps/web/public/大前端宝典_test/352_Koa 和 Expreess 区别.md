# Koa 和 Expreess 区别

1.  **中间件处理：**

- Koa 使用异步函数（ async/await ）的中间件处理，更简洁。
- Express使用 回调函数 的中间件处理，需要显式调用 next 函数。

1.  **错误处理：**

- Koa 内置错误处理，自动捕获和处理异常。
- Express需要手动编写错误处理中间件。

1.  **模块性：**

- Koa 更模块化，允许选择性添加功能。
- Express在核心包含更多功能，较重。

1.  **Node.js版本：**

- Koa 2需要Node.js 7.6或更高版本，因为它使用了 async/await 。
- Express适用于更旧的Node.js版本。
