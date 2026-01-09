# Dify 的 Workflow（工作流）是什么？

Workflow 是 Dify 的核心功能之一，用于定义 AI 应用的执行流程。解决了单一 Prompt 无法处理复杂逻辑的问题， 让模型具备“多步决策”和“自动化任务执行”的能力。可以让模型在多个步骤中依次调用：

- 模型推理（LLM Node）
- 外部 API（HTTP Node）
- 条件判断（If/Else Node）
- 工具执行（Tool Node）
- 数据处理（Code Node）
