# langGraph介绍

## langGraph是什么？

langGraph是Agent 编排框架，用于构建、管理和部署 长期运行、有状态 Agent 的低层编排框架。

由四要素构成：

- **State（状态）**：所有节点共享的一份数据；
- **Node（节点）**：一个函数，读 State、做事、返回要更新的内容；
- **Edge（边）**：决定一个节点之后去哪（固定边 / 条件边）；
- **Checkpointer（检查点）**：把 State 存下来，实现记忆与恢复。

## State（状态）

State存储langGraph中所有共享数据

```python
from typing import TypedDict

class HelperState(TypedDict):
    question: str      # 用户的问题（输入）
    category: str      # 分类结果：concept / code / chat（中间结果）
    answer:   str      # 最终回应（输出）
```

问题进来时填上 `question`，经过分类节点填上 `category`，经过回应节点填上 `answer`。

## Node（节点）

**节点不直接修改传进来的 State，而是返回一个「增量更新」**。LangGraph 会自动把你返回的字典合并进 State。没返回的字段保持原样。

```python
def classify_node(state: HelperState) -> dict:
    """分类节点：根据关键词判断问题类型"""
    q = state["question"]
    if "代码" in q or "报错" in q or "bug" in q:
        category = "code"
    elif "什么是" in q or "概念" in q or "原理" in q:
        category = "concept"
    else:
        category = "chat"
    return {"category": category}          # 只返回要更新的字段

def answer_concept_node(state: HelperState) -> dict:
    return {"answer": f"【概念解答】关于「{state['question']}」，它的核心思想是……"}

def answer_code_node(state: HelperState) -> dict:
    return {"answer": f"【代码助手】针对「{state['question']}」，我们一步步排查……"}

def answer_chat_node(state: HelperState) -> dict:
    return {"answer": "【闲聊】哈哈，没问题，我们继续聊～"}
```

## Edge（边）、搭图、编译、运行

```python
from langgraph.graph import StateGraph, START, END

builder = StateGraph(HelperState)          # ① 用 State 类型创建图构建器

builder.add_node("classify", classify_node)         # ② 注册节点（名字, 函数）
builder.add_node("answer",   answer_concept_node)

builder.add_edge(START, "classify")        # ③ 连边：START 是入口
builder.add_edge("classify", "answer")     #    分类后去回应
builder.add_edge("answer", END)            #    回应后结束（END 是出口）

graph = builder.compile()                  # ④ 编译成可执行的图

# ⑤ 运行：传入初始 State，拿回最终 State
result = graph.invoke({"question": "什么是装饰器", "category": "", "answer": ""})
print(result)
```

> 图流向：START → classify  →  answer →  END

1. **`StateGraph(HelperState)`**：创建一个「图构建器」，并告诉它图里流动的数据结构是 `HelperState`。
2. **`add_node("名字", 函数)`**：把一个函数注册成图上的节点，并给它起个名字（后面连边时用这个名字引用）。
3. **`add_edge(起点, 终点)`**：连一条固定的边。`START` 和 `END` 是 LangGraph 内置的特殊起点和终点——**入口必须从 `START` 连出，出口必须连到 `END`**。
4. **`compile()`**：把搭好的图编译成一个真正能执行的对象。
5. **`invoke(初始State)`**：从 `START` 开始执行，依次跑过各节点，每个节点的返回值被合并进 State，最后返回完整的最终 State。

## 分支结构

```python
from langgraph.graph import StateGraph, START, END

def route_by_category(state: HelperState) -> str:
    """路由函数：返回一个字符串路标，决定下一步去哪个节点"""
    return state["category"]      # 返回 "concept" / "code" / "chat"

builder = StateGraph(HelperState)

builder.add_node("classify", classify_node)
builder.add_node("concept",  answer_concept_node)
builder.add_node("code",     answer_code_node)
builder.add_node("chat",     answer_chat_node)

builder.add_edge(START, "classify")

# 条件边：分类后，根据 route_by_category 的返回值选择目标节点
builder.add_conditional_edges(
    "classify",                  # 从哪个节点出发
    route_by_category,           # 路由函数
    {                            # 路标 → 目标节点 的映射
        "concept": "concept",
        "code":    "code",
        "chat":    "chat",
    },
)

builder.add_edge("concept", END)
builder.add_edge("code",    END)
builder.add_edge("chat",    END)

graph = builder.compile()

# 试三种不同的问题，观察走了不同分支
for q in ["什么是装饰器", "这段代码报错怎么办", "今天天气不错"]:
    result = graph.invoke({"question": q, "category": "", "answer": ""})
    print(f"问题：{q}\n  → 分类：{result['category']}　回应：{result['answer']}\n")
```
图流向：

> ​                    ┌──► concept ────┐
> START ──► classify ──► code ─────┼──► END
> ​                    └──► chat  ─────┘
> ​              （由 route_by_category 决定走哪条）

## 加记忆

```python
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import HumanMessage, AIMessage

class ChatState(TypedDict):
    # Annotated[..., add_messages]：告诉 LangGraph 这个列表字段「追加」而非「覆盖」
    messages: Annotated[list, add_messages]

def reply_node(state: ChatState) -> dict:
    last_user_msg = state["messages"][-1].content        # 取最后一条用户消息
    history_count = len(state["messages"])               # 看看记住了几条
    reply = f"我收到了「{last_user_msg}」（当前历史共 {history_count} 条消息）"
    return {"messages": [AIMessage(content=reply)]}      # 返回的新消息会被「追加」

builder = StateGraph(ChatState)
builder.add_node("reply", reply_node)
builder.add_edge(START, "reply")
builder.add_edge("reply", END)

graph = builder.compile(checkpointer=MemorySaver())      # 绑定记忆

config = {"configurable": {"thread_id": "user-1"}}        # 同一对话的标识

graph.invoke({"messages": [HumanMessage(content="你好")]}, config)
result = graph.invoke({"messages": [HumanMessage(content="还记得我刚说了啥吗")]}, config)

for m in result["messages"]:
    print(f"{type(m).__name__}: {m.content}")
```

## interrupt 与 Command（人在环中）

