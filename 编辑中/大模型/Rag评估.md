# Rag评估

| 阶段         | 常见指标                                               |
| ------------ | ------------------------------------------------------ |
| 召回前       | query 分类准确率、改写成功率、意图识别准确率           |
| 初召回       | `Recall@50`、`Recall@100`、候选覆盖率                  |
| 融合         | dense/sparse/keyword 各路贡献率、RRF 后 Recall         |
| 重排         | `nDCG@K`、`MRR@K`、排序提升率                          |
| 过滤         | `Filtered Precision`、`Filtered Recall`、空 context 率 |
| 最终输入 LLM | 平均 context 数、平均 token 数、证据覆盖率             |

## 入库指标

### FAQ 完全重复率

### FAQ 空值率

### 低质量 chunk 比例

## 检索指标

### LangSmith 

- 从 Trace 发现问题

  - hit_type

  - sources_count

  - top_source_score

  - elapsed_ms

- Annotation 人工标注

  - expected_source

  - expected_hit_type

  - expected_keywords

- 加入 Dataset
  - 按 scenario_id 维护回归集

- 运行 Evaluation
  - Evaluator 读取输入、输出和标注
- 生成 Experiment
  - 对比版本、Prompt、检索参数
- Gate 复核
  - 结合本地领域指标决定是否发布

检索指标

- 召回率Recall@K
- 精确率Precision@K
- 关键词覆盖率
- 意图识别的准确率
- ndcg@K 与 MRR（Mean Reciprocal Rank）

MRR：第一个真正相关的文档排在召回列表的第几位

ndcg@K ：所有相关答案整体排得好不好，而且越相关、越靠前越好



## 生成指标

### 相关性

### 忠实率

## 性能指标

### 首 token 延迟(P50 / P95 / P99) 

### 完整回答耗时(P50 / P95 / P99 )

### 每阶段耗时

