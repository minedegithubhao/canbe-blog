# Model（模型）

## 模型接入

### `ChatOpenAI` 

调用商用大模型接口

```PYTHON
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import OllamaLLM, ChatOllama, OllamaEmbeddings
from langchain_openai import ChatOpenAI
import os

load_dotenv()

def demo01():
    # 通过OpenAI兼容接口调用商用大模型接口（deepseek、qwen）
    """
    model: 模型名称
    temperature: 采样温度
    openai_api_key: 密钥
    base_url: 接口地址
    max_token: 最大token数
    :return:
    """
    model = ChatOpenAI(model=os.getenv("MODEL"),
                       base_url=os.getenv("BASE_URL"),
                       openai_api_key=os.getenv("OPENAI_API_KEY"),
                       temperature=0.7,
                       max_tokens=1024)

    prompt = "给我讲个笑话，100字？"
    result = model.invoke(prompt)
    print(result)
```

### `OllamaLLM`

调用本地部署大模型

```python
def demo02():
    model = OllamaLLM(model=os.getenv("LOCAL_MODEL"),
                      base_url=os.getenv("LOCAL_URL"),
                      temperature=0.7,
                      max_tokens=1024)

    prompt = "给我讲个笑话，100字？"
    result = model.invoke(prompt)
    print(result)
```

### `ChatOllama`

调用本地部署大模型实现多角色对话

```python
def demo03():
    model = ChatOllama(model=os.getenv("LOCAL_MODEL"),
                       base_url=os.getenv("LOCAL_URL"),
                       temperature=0.7,
                       max_tokens=1024)

    message = [
        SystemMessage(content="你是一个著名的诗人。"),
        HumanMessage(content="帮我写一首唐诗")
    ]
    result = model.invoke(message)
    print(result)
```

### `OllamaEmbedding`

调用本地部署的`Embedding`模型

```python
def demo04():
    model = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
    # 单独嵌入
    r = model.embed_query("你好")
    print(f'r : {r}')

    # 批量嵌入
    r2 = model.embed_documents(["你好", "世界"])
    print(f'r2 : {r2}')
```

## 模型交互

### invoke

单个输入 -> 完整输出（同步）

```python
def demo01():
    """
    单次调用
    :return:
    """
    model = ChatOpenAI(model=os.getenv("MODEL"),
                       base_url=os.getenv("BASE_URL"),
                       openai_api_key=os.getenv("OPENAI_API_KEY"),
                       temperature=0.7,
                       max_tokens=1024)

    prompt = "给我讲个笑话，100字？"
    result = model.invoke(prompt)
    print(result)
```

### stream

单个输入 -> 逐token流式输出（异步）

```python
def demo02():
    """
    流式输出
    :return:
    """
    model = ChatOpenAI(model=os.getenv("MODEL"),
                       base_url=os.getenv("BASE_URL"),
                       openai_api_key=os.getenv("OPENAI_API_KEY"),
                       temperature=0.7,
                       max_tokens=1024)

    # prompt = "给我讲个笑话，200个字"
    # message = [HumanMessage(content=prompt)]

    prompt = "给我讲个笑话，200个字"
    result = model.stream(prompt)
    for chunk in result:
        print(chunk.content, end="", flush=True)
```

### batch

多个输入 -> 多个完整输出（同步）

```python
def demo03():
    """
    批量处理
    :return:
    """
    model = ChatOpenAI(model=os.getenv("MODEL"),
                       base_url=os.getenv("BASE_URL"),
                       openai_api_key=os.getenv("OPENAI_API_KEY"),
                       temperature=0.7,
                       max_tokens=1024)

    prompts = ["给我讲个笑话", "你是谁"]
    result = model.batch(prompts)

    # msg1 = [HumanMessage(content="给我讲个笑话")]
    # msg2 = [HumanMessage(content="你是谁")]
    # result = model.batch([msg1, msg2])
    print(result)
```

## 模型封装

因为项目中存在多次调用模型的场景，为了使用方便需要将模型的实例定义为公共函数使用，为了提高性能减少资源浪费，使用`@lru_cache`进行缓存（2个实例）

```python
"""
@lru_cache 是一个缓存机制（装饰器），可以将实例进行缓存，避免创建相同参数的多个实例，节省资源
"""
from functools import lru_cache


@lru_cache
def slow_add(a, b):
    """
    适用场景：
    1：创建示例对象（参数相对固定的情况）
    2：每次参数不同缓存的结果也不同，当传递的参数变化很大的情况，缓存会一直膨胀
    """
    print(f"计算结果: {a} + {b} = {a + b}")
    return a + b


slow_add(1, 2)
slow_add(2, 3)
slow_add(2, 3)
```

## 消息类型

`SystemMessage`, `HumanMessage`, `AIMessage`

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# 初始化模型
model = ChatOpenAI(model=os.getenv("MODEL"),
                   base_url=os.getenv("BASE_URL"),
                   openai_api_key=os.getenv("OPENAI_API_KEY"),
                   temperature=0.7,
                   max_tokens=1024)

# 构建完整对话历史
messages = [
    SystemMessage(content="你是一个AI助手，回答要简洁明了。"),
    HumanMessage(content="1+1等于几？"),
    AIMessage(content="1+1等于2。"),  # 模拟上一轮AI回复
    HumanMessage(content="那2+2呢？")
]

# 调用模型（基于历史对话继续回答）
response = model.invoke(messages)

print("AI回复：", response.content)
print("当前AI消息类型：", type(response))
```

## 提示词模板

### `PromptTemplate`

> 普通提示词模板，zero-shot

写法一

```python
def demo01():

    # 1. 定义 Prompt 模板
    prompt_template = PromptTemplate.from_template(
        "我的邻居姓{lastname}, 刚生了{gender}, 你帮我起个名字, 简单回答。"
    )

    prompt_text = prompt_template.format(lastname="张", gender="女儿")
    res = model.invoke(input=prompt_text)
    print(res)
```

### `FewShotPromptTemplate`

> 少样本提示词模板

```python
def demo02():
    # 定义示例模板
    example_template = PromptTemplate.from_template("单词:{word}, 反义词:{antonym}")

    # 示例数据（列表嵌套字典）
    example_data = [
        {"word": "大", "antonym": "小"},
        {"word": "上", "antonym": "下"}
    ]

    # 构建少样本提示词模板
    few_shot_prompt = FewShotPromptTemplate(
        example_prompt=example_template,
        examples=example_data,
        prefix="给出给定词的反义词，有如下示例：",
        suffix="基于示例告诉我：{input_word}的反义词是？",
        input_variables=['input_word']
    )

    # 生成最终提示词
    prompt_text = few_shot_prompt.invoke(input={"input_word": "左"}).to_string()
    print(prompt_text)
```

输出

```text
给出给定词的反义词，有如下示例：

单词:大, 反义词:小

单词:上, 反义词:下

基于示例告诉我：左的反义词是？
```

### format 和 invoke 的区别

![image-20260610083646584](model.assets/image-20260610083646584.png)

format 是  `BasePromptTemplate` 定义的方法，invoke 是 `Runnable` 定义的方法 

| 区别   | format                             | invoke                                                    |
| ------ | ---------------------------------- | --------------------------------------------------------- |
| 功能   | 纯字符串替换，解析占位符生成提示词 | Runnable 接口标准方法，解析占位符生成提示词               |
| 返回值 | 字符串                             | `PromptValue` 类对象                                      |
| 传参   | `.format(k=v, k=v, ...)`           | `.invoke({"k":v, "k":v, ...})`                            |
| 解析   | 支持解析 `{}` 占位符               | 支持解析 `{}` 占位符和 `MessagesPlaceholder` 结构化占位符 |

```python
template = PromptTemplate.from_template("我的邻居是：{lastname}，最喜欢：{hobby}")

res = template.format(lastname="张大明", hobby="钓鱼")
print(res, type(res))

res2 = template.invoke({"lastname": "周杰伦", "hobby": "唱歌"})
print(res2, type(res2))
```

输出

```text
我的邻居是：张大明，最喜欢：钓鱼 <class 'str'>
text='我的邻居是：周杰伦，最喜欢：唱歌' <class 'langchain_core.prompt_values.StringPromptValue'>

```

### `ChatPromptTemplate`

> 多角色消息模板 + 动态消息列表

```python
def demo03():
    chat_prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个边塞诗人，可以作诗。"),
            MessagesPlaceholder("history"),
            ("human", "请再来一首唐诗"),
        ]
    )

    history_data = [
        ("human", "你来写一个唐诗"),
        ("ai", "床前明月光，疑是地上霜，举头望明月，低头思故乡"),
        ("human", "好诗再来一个"),
        ("ai", "锄禾日当午，汗滴禾下锄，谁知盘中餐，粒粒皆辛苦"),
    ]

    # StringPromptValue    to_string()
    prompt_text = chat_prompt_template.invoke({"history": history_data}).to_string()

    print(prompt_text)def demo03():
    chat_prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个边塞诗人，可以作诗。"),
            MessagesPlaceholder("history"),
            ("human", "请再来一首唐诗"),
        ]
    )

    history_data = [
        ("human", "你来写一个唐诗"),
        ("ai", "床前明月光，疑是地上霜，举头望明月，低头思故乡"),
        ("human", "好诗再来一个"),
        ("ai", "锄禾日当午，汗滴禾下锄，谁知盘中餐，粒粒皆辛苦"),
    ]

    # StringPromptValue    to_string()
    prompt_text = chat_prompt_template.invoke({"history": history_data}).to_string()

    print(prompt_text)
```

### 使用`vars()`注入对象属性

> vars() 函数：将对象转换为字典后再解包，更加明确和安全

```python
    class Person:
        def __init__(self, lastname, hobby):
            self.lastname = lastname
            self.hobby = hobby

    person = Person("张三", "看电影")

    template = PromptTemplate.from_template("我的邻居是：{lastname}，最喜欢：{hobby}")

    res = template.format(**vars(person))
    print(res, type(res))

    res2 = template.invoke(vars(person))
    print(res2, type(res2))
```

## 链式调用

> 核心前提：即Runnable子类对象才能入链

```python
def demo01():
    """
    单链
    :return:
    """
    chat_prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个边塞诗人，可以作诗。"),
            MessagesPlaceholder("history"),
            ("human", "请再来一首唐诗"),
        ]
    )

    history_data = [
        ("human", "你来写一个唐诗"),
        ("ai", "床前明月光，疑是地上霜，举头望明月，低头思故乡"),
        ("human", "好诗再来一个"),
        ("ai", "锄禾日当午，汗滴禾下锄，谁知盘中餐，粒粒皆辛苦"),
    ]

    model = OllamaLLM(model="qwen2:0.5B")

    # 组成链，要求每一个组件都是Runnable接口的子类
    chain = chat_prompt_template | model

    # 使用invoke
    res = chain.invoke({"history": history_data})
    print(res)
    
    # 使用stream
    for chunk in chain.stream({"history": history_data}):
        print(chunk, end="", flush=True)
```

## 模型输出

### `StrOutputParser`

```python
def demo02():
    parser = StrOutputParser()
    model = OllamaLLM(model="qwen2.5:7B")
    prompt = PromptTemplate.from_template(
        "我姓居姓：{lastname}，刚生了{gender}，请起名，仅告知我名字无需其它内容。"
    )

    chain = prompt | model | parser

    res = chain.invoke({"lastname": "张", "gender": "女儿"})
    print(res)
```

### `JsonOutputParser`

> `JsonOutputParser` + 多步执行链，需要提示词中明确返回`JSON`格式，最好配合少样本使用

```python
def demo02():
    # 创建所需的解析器
    str_parser = StrOutputParser()
    json_parser = JsonOutputParser()

    # 模型创建
    model = ChatTongyi(model="qwen3-max")

    # 第一个提示词模板
    first_prompt = PromptTemplate.from_template(
        "我姓居姓：{lastname}，刚生了{gender}，请帮忙起名字，"
        "并封装为JSON格式返回给我。要求key是name，value就是你起的名字，请严格遵守格式要求。"
    )

    # 第二个提示词模板
    second_prompt = PromptTemplate.from_template(
        "姓名：{name}，请帮我解析含义。"
    )

    # 构造链
    chain = first_prompt | model | json_parser | second_prompt | model | str_parser

    res = chain.stream({"lastname": "张", "gender": "女儿"})

    for chunk in res:
        print(chunk)
```

### 自定义函数

> 简单快捷，返回一个字段，快速实现

```python
def demo03():
    str_parser = StrOutputParser()
    # 第一个提示词模板
    first_prompt = PromptTemplate.from_template(
        "我姓居姓：{lastname}，刚生了{gender}，请帮忙起名字，仅告诉我名字，不要额外信息"
    )

    # 第二个提示词模板
    second_prompt = PromptTemplate.from_template(
        "姓名：{name}，请帮我解析含义。"
    )

    # 模型创建
    model = ChatTongyi(model="qwen3-max")
    
	# 函数的入参：AIMessage -> dict  ({"name": "xxx"})
    # my_func = RunnableLambda(lambda ai_msg: {"name": ai_msg.content})
    my_fun = RunnableLambda(lambda ai_msg: {'name': ai_msg.content})

    # 构造链
    chain = first_prompt | model | my_fun | second_prompt | model | str_parser

    res = chain.stream({"lastname": "张", "gender": "女儿"})

    for chunk in res:
        print(chunk)
```

### `with_structured_output + Pydantic` 模型

> 复杂实体抽取，封装为自定义`Pydantic`对象，常用于意图识别

#### 意图识别

```python
from pydantic import BaseModel, Field
from typing import Literal

# 定义输出结构
class IntentLLMDecision(BaseModel):
    intent: Literal["GREETING", "FAQ_QUERY", "KNOWLEDGE_QUERY",
                    "FOLLOW_UP", "HUMAN_SERVICE", "OUT_OF_SCOPE"]  # 意图分类
    confidence: float = Field(default=0.6, ge=0.0, le=1.0)  # 置信度范围0~1之间
    reason: str = Field(default="")  # 理由

# 创建带结构化输出的模型
model = get_chat_model(streaming=False)
structured_model = model.with_structured_output(IntentLLMDecision)

# 调用 — 返回值是 Pydantic 对象，不是字符串
decision = structured_model.invoke([
    SystemMessage(content="你是意图识别助手..."),
    HumanMessage(content="用户问：入职流程有哪些步骤？"),
])

print(decision.intent)      # "KNOWLEDGE_QUERY"
print(decision.confidence)  # 0.85
print(decision.reason)      # "用户询问企业流程制度类问题"
```

#### 封装自定义`Pydantic`对象

```python
def demo04():
    model = ChatTongyi(model="qwen3-max")

    class NameResult(BaseModel):
        name: str = Field(description="起好的姓名")
        meaning: str = Field(description="姓名含义")

    structured_model = model.with_structured_output(NameResult)

    prompt = PromptTemplate.from_template(
        "我姓：{lastname}，刚生了{gender}，请起一个名字，并解释含义。"
    )

    chain = prompt | structured_model

    res = chain.invoke({
        "lastname": "张",
        "gender": "女儿",
    })
    print(res)
    print(type(res))
```

#### 多步执行链

```python
def demo04():
    model = ChatTongyi(model="qwen3-max")

    class NameResult(BaseModel):
        name: str = Field(description="起好的姓名")
        meaning: str = Field(description="姓名含义")

    structured_model = model.with_structured_output(NameResult)

    # 第一个提示词模板
    first_prompt = PromptTemplate.from_template(
        "我姓居姓：{lastname}，刚生了{gender}，请帮忙起名字，仅告诉我名字，不要额外信息"
    )

    # 第二个提示词模板
    second_prompt = PromptTemplate.from_template(
        "姓名：{name}，请帮我解析含义。"
    )

    chain = first_prompt | structured_model | second_prompt | model | StrOutputParser()

    res = chain.invoke({
        "lastname": "张",
        "gender": "女儿",
    })
    print(res)
    print(type(res))
```

