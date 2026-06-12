# Milvus向量数据库

## 主流索引类型

### `FLAT` — 暴力搜索

核心思想：暴力搜索计算所有向量相似度。

```text
FLAT 不做任何索引优化。搜索时逐条计算距离。

数据: [v1, v2, v3, v4, v5, ..., v1000000]
查询: q
      ↓
      q 与 v1 计算距离
      q 与 v2 计算距离
      ...
      q 与 v1000000 计算距离
      ↓
      排序 → 取 Top-10

✅ 精度 100%（找到的一定是最近邻）
❌ 速度最慢 O(N×D)
🎯 适用：需要 100% 精确召回的小规模数据、离线评测基准，或强过滤后候选集很小的场景
```

### `IVF_FLAT` — 倒排索引 + 暴力搜索

也称为：ANN分桶

核心思想

- 构建时：对向量使用K-Means进行聚类，对聚类建立倒排索引
- 检索时：检索最近的N个聚类，然后对选定的聚类进行暴力搜索

```text
构建阶段：
	设置nlist=128 个聚类中心作为构建中心点的数量，Milvus 文档给出的取值范围是 [1, 65536]，默认值 128，常用建议范围是 [32, 4096]；值越大，簇更细，构建时间也更高

查询阶段：
	设置nprobe=4 个聚类中心查询中心点的数量，Milvus 文档给出的取值范围是 [1, nlist]，默认值 8；值越大，召回率更高，查询延迟也更高
	
适用场景：
    ✅ 通常比 FLAT 更快
    ✅ 内存占用比 HNSW 小
    ❌ 精度取决于 nprobe（可能漏掉边界附近的向量）
    🎯 适用：希望在召回率、内存和查询延迟之间做平衡的场景
```

### `IVF_SQ8` — 倒排索引 + 量化压缩 + 暴力搜索

核心思想

- 构建时：对向量使用K-Means进行聚类，对聚类建立倒排索引，**再对聚类内的向量进行量化压缩**。(`float32 -> int8`)
- 检索时：检索最近的N个聚类，然后对选定的聚类进行暴力搜索。
- 优点：内存占用变为原来的1/4，提高查询速度

```text
IVF_FLAT 的改进版：对向量做压缩，减少内存占用。

IVF_FLAT：
  每个向量以 1024 个 float32 存储 → 4096 字节/向量

IVF_SQ8（标量量化）：
  每个维度从 float32 压缩为 uint8 → 1024 字节/向量
  内存明显下降，但召回效果需要用评测集验证

IVF_PQ（乘积量化）：
  将 1024 维切分为多段，每段独立量化
  可进一步压缩向量表示
  压缩越强，内存越省，但召回损失越需要压测和评测确认

🎯 适用：内存压力明显、可以接受近似误差，并且有评测集校准召回率的场景
```

### `HNSW` —  图索引

核心思想：类树形的图索引，主干快速定位，叶子节点暴力检索。主要有如下3个参数：

- `M`：每个节点最大同层连接数，越大连通性越好，召回率更高，但内存和耗时上升，常规取值 `12~32`，`Milvus`，默认推荐 `M=16`。
- `efc / efConstruction`: 构建时搜索宽度，越大筛选更优质的近邻边，索引质量更好，但构建更慢，常用 `efConstruction=200`。
- `ef / efSearch`：查询时搜索宽度，遍历候选节点数，越大找到真实 `TopK`近邻的概率更高，召回效果更好，但计算次数变多，查询延迟升高，`QPS`下降，常用 `32~128`，`efSearch` 必须 ≥ 业务查询的 `TopK`

### 索引选型

- 小规模选暴力检索`FLAT`
- 中大规模可以选`HSNW`/`IVF_FLAT`
- 中大规模内存不够可以使用压缩版`HSNW-SQ8`/`IVF_SQ8`
- 主要还是看数据量和预算

## pymilvus 基本操作

### 连接 `Milvus`

```python
from pymilvus import MilvusClient

# 方式二：MilvusClient（新版 API，更简洁）
client = MilvusClient(uri="http://127.0.0.1:19530")
# 查看所有 Collection/表
collections = client.list_collections()
print(collections)
```

`MilvusClient`优点：

- 内部自动管理连接池，不需要手动维护
- 支持上下文管理器(with语句)
- 支持线程安全

### 创建数据库`DataBase`

```python
# 连接客户端
client = MilvusClient(uri="http://127.0.0.1:19530")

# 创建 数据库
databases = client.list_databases()
if "rag_demo" not in databases:
    client.create_database("rag_demo")
```

- 如果数据库已存在，重新创建会报错。

### 创建 Schema 和 Collection

```python
from pymilvus import CollectionSchema, FieldSchema, DataType, MilvusClient

# 定义字段
pk_field = FieldSchema(name="pk", dtype=DataType.VARCHAR, is_primary=True,max_length=128)
text_field = FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535)
dense_field = FieldSchema(name="dense", dtype=DataType.FLOAT_VECTOR, dim=1024)
sparse_field = FieldSchema(name="sparse", dtype=DataType.SPARSE_FLOAT_VECTOR)
source_field = FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=64)
kb_version_field = FieldSchema(name="kb_version", dtype=DataType.VARCHAR, max_length=128)

# 创建 Schema
schema = CollectionSchema(
    fields=[pk_field,text_field,dense_field,sparse_field,source_field,kb_version_field],
    description="教学用 FAQ 集合",
    enable_dynamic_field=True,
)

# 连接客户端
client = MilvusClient(uri="http://127.0.0.1:19530")

# 创建 Collection, 存在则不再创建
client.create_collection(collection_name="demo_collection", schema=schema)

# 获取所有 Collection
collections = client.list_collections()

print(collections)
```

字段说明

- enable_dynamic_field：动态的添加列，默认为 False，开启后允许动态添加列。
- 动态添加的列，使用`$meta["动态字段名"]`来进行过滤，**无法创建索引**。

### 创建索引 Index

```python
from pymilvus import MilvusClient
from pymilvus.milvus_client.index import IndexParams

client = MilvusClient(uri="http://127.0.0.1:19530")

def demo02():
    index_params = client.prepare_index_params()
    index_params.add_index(
        field_name="dense",
        index_type="HNSW",
        metric_type="COSINE",
        params={"M": 16, "efConstruction": 200}
    )
    client.create_index("demo_collection", index_params)
    # 查看索引
    print(client.list_indexes("demo_collection"))
    # 查看索引详情
    print(client.describe_index("demo_collection", "dense"))

```

- create_index已经实现幂等：不存在则创建，存在则跳过。
- M：每个节点最多连接16个邻居。
- efConstruction：构建时搜索宽度，越大搜索质量越高，构建时间越久

### 插入数据

```python
entities = [
    {
        "pk": "doc_trade_001",
        "text": "跨境申报要检查 HS 编码、原产地证明和许可证要求。",
        "dense": np.random.rand(1024),
        "source": "trade",
        "kb_version": "v2"
    },
    {
        "pk": "doc_trade_002",
        "text": "制裁名单命中后应暂停交易并提交合规复核。",
        "dense": np.random.rand(1024),
        "source": "trade",
        "kb_version": "v2"
    }
]

mr = client.upsert('demo_collection', data=entities)
# 刷新
client.flush("demo_collection")
client.load_collection('demo_collection')
```

### 查询数据

```python
client = MilvusClient(uri="http://127.0.0.1:19530")

# 根据条件过滤
result = client.query(
    collection_name="demo_collection",
    filter='source == "trade"',
    limit=5,
    output_fields=["pk", "text", "source"]
)

print(f"总共有 {len(result)} 条数据")
```

## langchain_milvus 基本操作

```python
"""
基于langchain演示milvus封装的完整实现流程
1：构建Milvus-》自动构建collection+schema+index+load
2：BM25BuildInFunction-》自动的生成Sparse向量
3：add_documents-》自动Embedding（Dense）+BM25（sparse）+Insert+Flush
4：similarity_search_with_score()—》自动Embedding query+search+结果包装
"""
from langchain_community.embeddings import OllamaEmbeddings
from langchain_core.documents import Document
from langchain_milvus import BM25BuiltInFunction, Milvus


# 1:BM25内置函数实例
def bm25_function():
    # 创建BM25内置函数，输入字段为text，输出字段为sparse
    return BM25BuiltInFunction(input_field_names="text",
                               output_field_names="sparse",
                               analyzer_params={"type": "chinese"},  # 分词器类型：中文分词器
                               enable_match=True)  # 启用BM25 Match、精确匹配
                               
        
# 自动创建Milvus向量数据库实例
def milvus_vectorstore():
    # 创建Embedding实例
    embedding = OllamaEmbeddings(model="nomic-embed-text")

    store = Milvus(embedding_function=embedding,  # 自动生成稠密向量
                   builtin_function=bm25_function(),  # 自动生成稀疏向量
                   collection_name='milvus_collection',  # 集合名称
                   connection_args={"uri": "http://127.0.0.1:19530"},
                   vector_field=["dense", "sparse"],  # 稠密、稀疏向量字段名称
                   text_field="text",
                   primary_field="pk",
                   auto_id=False,  # 手动创建id
                   enable_dynamic_field=True,
                   consistency_level="Session",
                   drop_old=False)

    # 3：写入文档知识库
    documents = [
        Document(
            page_content="入职流程包括提交材料、签订劳动合同、部门审批和账号开通。",
            metadata={"source": "hr", "doc_id": "hr_001"},
        ),
        Document(
            page_content="报销流程包括提交发票、直属经理审批、财务复核和付款。",
            metadata={"source": "finance", "doc_id": "fin_001"},
        ),
    ]
    store.add_documents(documents, ids=["hr_001", "fin_001"])

    # 检索
    result = store.similarity_search_with_score("入职需要哪些流程？", k=2)

    for doc, score in result:
        print(f'score:{score}')
        print(f'content: {doc.page_content}')
        print(f'metadata: {doc.metadata}')


if __name__ == '__main__':
    milvus_vectorstore()
```

