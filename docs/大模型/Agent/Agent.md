# Agent

Agent 智能体 = 大语言模型（大脑）+ 工具集（手脚）+ 决策逻辑（思维），是让 LLM 从“只会回答”升级为“会做事（影响现实世界）”的智能助手。

## Agent初体验

```python
from langchain.agents import create_agent
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool


@tool(description="查询天气")
def get_weather():
    return "晴天"


agent = create_agent(
    model=ChatTongyi(model="qwen3-max"),
    tools=[get_weather],
    system_prompt="你是一个聊天助手，可以回答用户问题！"
)

res = agent.invoke(
    {"messages": [
        {"role": "user", "content": "明天深圳的天气如何呀？"}
    ]}
)

parser = StrOutputParser()

for msg in res["messages"]:
    print(f"{type(msg).__name__}: {parser.invoke(msg)}")
```

## Agent默认React行动框架展示

Agent ReAct 是大模型智能体的核心思考与行动框架，全称 Reasoning + Acting（推理 + 行动），是让 Agent 像人类一样「思考→行动→观察→直到得到结果」的关键逻辑。

```python
from langchain.agents import create_agent
from langchain_community.chat_models.tongyi import ChatTongyi
from langchain_core.tools import tool


@tool(description="获取体重，返回值是整数，单位千克")
def get_weight() -> int:
    return 90


@tool(description="获取身高，返回值是整数，单位厘米")
def get_height() -> int:
    return 172


agent = create_agent(
    model=ChatTongyi(model="qwen3-max"),
    tools=[get_weight, get_height],
    system_prompt="""你是严格遵循ReAct框架的智能体，必须按「思考→行动→观察→再思考」的流程解决问题。
且**每轮仅能思考并调用1个工具**，禁止单次调用多个工具。
并告知我的思考过程：工具的调用原因，按照思考、行动、观察三个结构告知我""",
)

for chunk in agent.stream(
        input={"messages": [{"role": "user", "content": "计算我的BMI"}]},
        stream_mode="values"
):
    latest_message = chunk["messages"][-1]

    if latest_message.content:
        print(type(latest_message).__name__, latest_message.content)

    try:
        if latest_message.tool_calls:
            print(f"工具调用: {[tc['name'] for tc in latest_message.tool_calls]}")
    except AttributeError:
        pass

```



## Agent交互

### invoke

```python
res = agent.invoke(
    {"messages": [
        {"role": "user", "content": "明天深圳的天气如何呀？"}
    ]}
)
```

### stream

```python
for chunk in agent.stream(
        {"messages": [{"role": "user", "content": "传智教育股价多少，并介绍一下"}]},
        stream_mode="values"):
    latest_message = chunk['messages'][-1]

    if latest_message.content:
        print(type(latest_message).__name__, latest_message.content)
	if latest_message.tool_calls:
        print(f"工具调用: {[tc['name'] for tc in latest_message.tool_calls]}")
```

## Agent中间件MiddleWare

### 节点式钩子（执行点顺序拦截）

```python
@tool(description="查询天气")
def get_weather() -> str:
    return "晴天"


@before_agent
def log_before_agent(state: AgentState, runtime: Runtime) -> None:
    print(f"[before_agent]Starting agent with {len(state['messages'])} messages")


@after_agent
def log_completion(state: AgentState, runtime: Runtime) -> None:
    print(f"[after_agent]Agent completed with {len(state['messages'])} messages")


@before_model
def log_before_model(state: AgentState, runtime: Runtime) -> None:
    print(f"[before_model]About to call model with {len(state['messages'])} messages")


@after_model
def log_latest_message(state: AgentState, runtime: Runtime) -> None:
    print("after_model", state["messages"][-1].content)
```

- `before_agent`: agent 执行之前拦截
- `after_agent`: agent 执行后拦截
- `before_model`: 模型执行前拦截
- `after_model`: 模型执行后拦截

### 针对工具和模型的包装式钩子

```python
@wrap_model_call
def retry_on_error(request, handler):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print("wrap_model_call")
            return handler(request)
        except Exception:
            if attempt == max_retries - 1:
                raise


@wrap_tool_call
def monitor_tool(
    request: ToolCallRequest,
    handler: Callable[[ToolCallRequest], ToolMessage | Command],
) -> ToolMessage | Command:
    print(f"[wrap_tool_call]Executing tool: {request.tool_call['name']}")
    print(f"[wrap_tool_call]Arguments: {request.tool_call['args']}")
    try:
        result = handler(request)
        print(f"[wrap_tool_call]Tool completed successfully")
        return result
    except Exception as e:
        print(f"[wrap_tool_call]Tool failed: {e}")
        raise


agent = create_agent(
    model=ChatTongyi(model="qwen3-max"),
    tools=[get_weather],
    middleware=[monitor_tool, retry_on_error, log_latest_message, log_before_model, log_completion, log_before_agent]
)

res = agent.invoke({"messages": [{"role": "user", "content": "今天天气如何呀，如何穿衣"}]})
print("*********\n", res)
```

- `wrap_model_call`: 每个模型调用时拦截
- `wrap_tool_call`: 每个工具调用时拦截