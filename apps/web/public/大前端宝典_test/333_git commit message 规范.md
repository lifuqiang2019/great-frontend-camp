# git commit message 规范

**模板：**

Plaintext  
Type(Scope): Summary  

Body  
Reference

- **类型（Type）：** 提交的类型
- feat: 新功能（feature）
- fix: 修复bug
- docs: 文档更新
- style: 代码样式调整，不涉及代码逻辑变化（例如，空格、格式化）
- refactor: 代码重构
- test: 添加或修复测试
- chore: 杂项任务，如构建过程、工具等
- **范围（Scope）（可选）：** 提交的范围，表示影响的模块或组件。
- **摘要（Summary）：** 一句话描述提交的目的，尽量简洁但具体。
- **详细说明（Body）（可选）：** 提供更详细的信息，解释为什么进行了这个更改，以及更改的背后逻辑。
- **引用（Reference）（可选）：** 如果提交与某个问题、任务或讨论有关，可以在消息中引用它们的ID或链接。

**示例：**

Plaintext  
feat(core): 添加用户身份验证功能  

用户身份验证功能的添加，包括登录和注册功能，以及JWT令牌生成。  
解决了#123的问题。
