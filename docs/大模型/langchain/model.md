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

> 普通提示词模板

写法一

```python
def demo01():
    # 定义一个模板
    template = PromptTemplate.from_template("用一句话介绍{company}的{product}")
    # 填充变量
    prompt_value = template.invoke({"company": "阿里云", "product": "通义千问"})
    print(prompt_value.text)
```

写法二

```python
def demo01():
    # 定义模板
    template = PromptTemplate(
        input_variables=["topic", "style"],
        template="写一段关于 {topic} 的文案，风格是 {style}。"
    )

    # 填充变量生成提示词
    prompt = template.format(topic="夏天", style="治愈温柔")
    print("生成的提示词：", prompt)
```

### `FewShotPromptTemplate`

> 少样本提示词模板

写法一

```python
def demo02():
    # 1. 示例数据（字典列表）
    examples = [
        {"q": "1+1", "a": "2"},
        {"q": "3+5", "a": "8"},
    ]

    # 2. 示例模板（一行）
    example_tpl = PromptTemplate.from_template("Q:{q}\nA:{a}")

    # 3. 少样本模板（最简）
    fewshot = FewShotPromptTemplate(
        examples=examples,
        example_prompt=example_tpl,
        suffix="Q:{input}\nA:",  # 最后用户输入
        input_variables=["input"]
    )

    # 4. 调用（和 PromptTemplate 用法一致）
    val = fewshot.invoke({"input": "7*3"})
    print(val.text)

demo_fewshot_simple()
```

写法二

```python
def demo02():
    # 定义示例（模型学习的模板）
    examples = [
        {"question": "1+1=?", "answer": "2"},
        {"question": "3+5=?", "answer": "8"},
        {"question": "10-4=?", "answer": "6"}
    ]

    # 定义示例模板
    example_prompt = PromptTemplate(
        input_variables=["question", "answer"],
        template="问题：{question} 答案：{answer}"
    )

    # 定义FewShot模板
    few_shot_prompt = FewShotPromptTemplate(
        examples=examples,
        example_prompt=example_prompt,
        prefix="你是一个只会回答数字的计算器，根据示例直接给出答案：",
        suffix="问题：{input} 答案：",
        input_variables=["input"]
    )

    # 填充变量
    prompt = few_shot_prompt.format(input="7*3=?")
    print("生成的提示词：\n", prompt)

    # 调用模型
    response = model.invoke(prompt)
    print("AI回复：", response)
```

### `ChatPromptTemplate`

> 对话提示词模板

```python
def demo03():
    # 定义多角色模板
    chat_template = ChatPromptTemplate.from_messages([
        ("system", "你是一个擅长讲冷笑话的AI，每次回答都要讲一个和用户问题相关的冷笑话。"),
        ("human", "我今天好困啊。"),
        ("ai", "那你知道为什么困的人不能去爬山吗？因为怕“睡”过头！"),
        ("human", "{user_input}")
    ])

    # 填充变量
    prompt = chat_template.format(user_input="我今天好饿啊。")

    print(prompt_value)
```

### `SystemMessage + HumanMessage`

```python
def demo04():
    # 定义多角色模板
    chat_template = ChatPromptTemplate.from_messages([
        ("system", "你是{business_domain}的知识助手，名叫{assistant_name}。"),
        ("system", "你只能基于提供的资料回答，不得超出资料范围。"),
        ("human", "参考资料：\n{context}\n\n用户问题：{query}"),
    ])

    # 填充变量
    prompt_value = chat_template.invoke({
        "business_domain": "企业内部制度与流程",
        "assistant_name": "小知",
        "context": "[1] 来源：人事制度\n入职流程包括...",
        "query": "入职需要哪些材料",
    })
    
    print(prompt_value)
```



## 模型输出

模型默认输出的是字符串类型，但是有些场景下需要模型输出的是结构化数据，因此需要使用：`with_structured_output`，使用`pydantic`约束模型的输出类型

