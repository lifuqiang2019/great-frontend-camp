# Dify 的知识库（Knowledge Base）在 RAG 中起什么作用？

Dify 的知识库是实现 RAG（检索增强生成）的关键模块。当用户上传文档、网页或文本时，Dify 会自动：

1.  分片（Chunking）：将文档拆成小块；
2.  向量化（Embedding）：把文本转为向量；
3.  语义检索（Retrieval）：根据用户问题查找最相关内容；
4.  上下文拼接（Augmentation）：把检索结果加入 Prompt；
5.  生成回答（Generation）：LLM 生成基于事实的回答。
