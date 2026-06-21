# 企业级FastAPI项目

## 启动校验

```python
@app.on_event("startup")
async def warmup_runtime() -> None:
    """服务启动时执行前置校验，并预热本地检索模型和 Milvus 连接。

    当前项目的环境是必需前置条件：LLM Key、Milvus、MySQL、本地模型、场景配置和
    active 知识库版本缺失时，服务直接启动失败。这样可以避免页面看似能打开，但真正
    提问时才发现核心链路没有通电。
    """
    summary = validate_runtime_environment()
    logger.info("Runtime preflight passed: %s", summary)
    await asyncio.to_thread(warmup_retrieval_stack)
```

启动时做了两件事：

1. **`validate_runtime_environment()`**：逐个检查所有前置条件，任何一个不满足就抛 `RuntimeError`，FastAPI 会阻止服务启动。
2. **`warmup_retrieval_stack()`**：预热全部 8 个场景的 FAQ 和文档 Milvus Collection。这个操作是同步的（涉及模型加载和网络连接），用 `asyncio.to_thread` 放到线程池执行。

### 校验清单

```text
1.  LLM API Key 是否配置（非占位符）
2.  Admin Token 是否配置（非占位符）
3.  Embedding 模型目录是否存在
4.  Reranker 模型目录是否存在
5.  场景配置目录是否存在
6.  活跃场景文档目录是否存在
7.  活跃场景 FAQ 文件是否存在
8.  Milvus TCP 可达性
9.  MySQL TCP 可达性
10. LLM 真实连通性（发送测试请求）
11. Active 知识库版本是否存在
```

### 占位符检测

检查`.env`中的占位符是否被正确的替换

```python
PLACEHOLDER_VALUES = {"", "replace-with-real-key", "replace-with-random-token",
                      "changeme", "change-me"}

def _is_placeholder(value: str | None) -> bool:
    """判断配置值是否为空或仍是示例占位符。"""
    normalized = str(value or "").strip()
    return normalized.lower() in PLACEHOLDER_VALUES
```

### TCP 连接校验

验证`milvus`、`mysql`是否启动

```python
def _require_tcp(name: str, host: str, port: int, timeout: float = 3.0) -> None:
    """校验 TCP 端口可连接。

    这里只做连接性检查，不做业务读写。真实集合、表结构和模型预热会在后续
    warmup 中完成。把端口检查放在这里，是为了让"服务没启动"这类基础问题
    在最早阶段暴露。
    """
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return
    except OSError as exc:
        raise RuntimeError(
            f"{name} 不可连接：{host}:{port}。请先启动必需环境。"
        ) from exc
```

### 路径校验

检查模型目录（`models/bge-m3`、`models/bge-reranker-large`）等本地资源是否存在。

```python
def _require_path(name: str, raw_path: str) -> None:
    """校验本地目录或文件存在。"""
    path = Path(raw_path)
    if not path.exists():
        raise RuntimeError(f"{name} 不存在：{path}")
```

### LLM 连通性验证

```python
# qa_core/llm/client.py
def validate_llm_connectivity():
    """发送一个最小请求验证 LLM API Key 和网络连通性。

    不是所有启动校验都是简单的 TCP 连接。LLM API 是 HTTP 服务，
    需要在应用层验证 API Key 是否有效、余额是否充足、网络是否可达。
    """
    model = get_chat_model(streaming=False)
    response = model.invoke("ping")  # 发送测试请求
    # 如果 API Key 无效、欠费或网络不通，这里会直接抛异常
```

### Active 知识库版本校验

判断知识库版本号是否读取到并激活

```python
version_store = get_kb_version_store(scenario.scenario_id)
try:
    active_version = version_store.resolve_active_version()
except ValueError as exc:
    raise RuntimeError(
        f"{exc}。请先执行入库并激活版本，例如 "
        "scripts/rebuild_kb_version.py --new-version --force --activate。"
    ) from exc
```

## 检索栈预热

BGE-M3 Embedding 模型和 Milvus 的连接初始化都有首次访问延迟：

- **模型加载**：BGE-M3 模型文件约 2GB，首次加载需要 5-15 秒
- **Milvus 连接**：首次创建 Collection 对象需要获取 schema 信息

如果不在启动时预热，**第一个提问的用户将承受所有这些延迟**。

> 核心思想：预检索，跑一次检索