# langchain

## 概念

langchain是一个开源的LLM开发框架，集成了大量的大语言模型，可以让开发者专注于业务的开发，不需要关注与各模型厂商的集成。

## 大语言模型

• **`LLMs`**: 是技术范畴的统称，指基于大参数量、海量文本训练的 Transformer 架构模型，核心能力是理解和生成自然语言，主要服务于文本生成场景。

• **聊天模型**: 是应用范畴的细分，是专为对话场景优化的 LLMs，核心能力是模拟人类对话的轮次交互，主要服务于聊天场景。

• **文本嵌入模型**: 文本嵌入模型接收文本作为输入，得到文本的向量。

## 三大核心抽象

- **Model（模型）**：对 LLM 的统一封装。不管是 OpenAI、DashScope 还是本地模型，都用相同的接口调用。

- **Chain（链）**：把多个步骤串成一个流程。LangChain 的 LCEL（LangChain Expression Language）用管道符 `|` 串联组件。本项目没有使用 LangChain 的高层 Chain 抽象（如 `RetrievalQA`），而是自己编排 RAG 流程。

- **Agent（智能体）**：比 Chain 更灵活 — LLM 自己决定下一步做什么、调用哪个工具。本项目的二期规划中会用到 LangGraph Agent。

  