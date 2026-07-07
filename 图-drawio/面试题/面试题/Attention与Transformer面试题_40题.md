# Attention 与 Transformer 面试题 40 题

> 适用目标：AI / NLP / LLM / 深度学习方向面试复习  
> 难度分布：少量初级 + 主要中级 + 少量高级  
> 题型：纯问答  
> 结构：前半部分只放题目，后半部分放题目与详细答案  
> 说明：Attention 和 Transformer 分别 20 题，其中保留少量关联题，帮助串联两个知识点。

## 一、题目区：Attention 20 题（√）

1. 什么是 Attention 机制？它解决了序列建模中的什么问题？加语义，？
2. Self-Attention 和普通 Attention / Cross-Attention 有什么区别？加语义，可以用来翻译
3. Query、Key、Value 分别是什么？为什么要拆成这三个向量？查询，键，值，因为就是这样设计的
4. Scaled Dot-Product Attention 的公式是什么？每一步在做什么？相乘
5. 为什么 Attention 里要对 `QK^T` 除以 `sqrt(d_k)`？因为要降温，不然某个会极端，其他的就太小了
6. Softmax 在 Attention 中起什么作用？看每个的比例
7. 什么是 Attention Weight / Attention Pattern？它能直接解释模型为什么这么回答吗？？？权重，上下文矩阵的模块
8. 为什么 Decoder 或 GPT 类模型需要 Masked Self-Attention？不泄露答案
9. Causal Mask 和 Padding Mask 有什么区别？不知道
10. Multi-Head Attention 相比 Single-Head Attention 有什么优势？ 能给token加更多含义
11. 多个 Attention Head 是否一定分别学到了不同的人类可解释规则？ 不一定
12. Attention 的时间复杂度和空间复杂度是多少？为什么长上下文很贵？ pattern 太大了
13. 如果输入序列长度翻倍，标准 Self-Attention 的计算量大约如何变化？指数
14. Attention 中的 Value 向量到底传递了什么？它和 Key 的区别是什么？向量要变的信息，能提供什么
15. 为什么说 Attention 可以帮助模型处理长距离依赖？矩阵，
16. Attention 和 RNN 处理上下文的方式有什么不同？不知道
17. 在一句话中，一个 token 是如何通过 Attention 吸收其他 token 信息的？qkv
18. Cross-Attention 常见于哪些模型结构或任务？不知道
19. Attention 机制有哪些局限性？不知道
20. 请把 Attention 机制和 Transformer 的整体结构联系起来说明。不知道

## 二、题目区：Transformer 20 题

1. Transformer 是什么？它和传统 RNN / LSTM 最大的区别是什么？
2. Transformer 的基本结构由哪些核心模块组成？
3. 为什么 Transformer 需要 Positional Encoding 或 Position Embedding？
4. Sinusoidal Positional Encoding 和 Learned Position Embedding 有什么区别？
5. Transformer Encoder 和 Decoder 的结构有什么不同？
6. Encoder-only、Decoder-only、Encoder-Decoder 模型分别适合什么任务？
7. GPT 和 BERT 在 Transformer 架构和训练目标上有什么区别？
8. Transformer 中 Feed Forward Network / MLP 的作用是什么？
9. 残差连接 Residual Connection 在 Transformer 中有什么作用？
10. LayerNorm 在 Transformer 中有什么作用？Pre-LN 和 Post-LN 有什么区别？
11. Transformer 为什么比 RNN 更容易并行训练？
12. Transformer 如何从 token 得到最终的下一个 token 概率？
13. Tokenization、Embedding、Unembedding 分别是什么？
14. Transformer 中参数主要分布在哪些部分？
15. 为什么说 Transformer 是“可扩展”的架构？
16. Transformer 的上下文窗口 Context Window 是什么？它和模型记忆有什么区别？
17. Transformer 在训练和推理时有什么差异？
18. 为什么 Decoder-only Transformer 适合做自回归文本生成？
19. Transformer 有哪些常见变体和优化方向？
20. 如果面试官让你完整讲一遍 Transformer 中一次前向传播，你会怎么讲？

---

## 三、答案区：Attention 20 题

## Attention 1. 什么是 Attention 机制？它解决了序列建模中的什么问题？

**标准回答：**  
Attention 是一种让模型在处理当前 token 时，动态选择并聚合其他 token 信息的机制。它解决的问题是：序列中不同位置的重要性不同，模型不应该只依赖固定长度隐藏状态，而应该能根据当前需求关注相关位置。

**口语化回答：**  
你可以把 Attention 理解成“模型在看一个词的时候，会自己判断前后哪些词更重要”。重要的词多看一点，不重要的词少看一点，然后把这些信息合起来，帮助它理解当前这个词。

**详细解释：**  
在 NLP 中，一个词的含义常常依赖上下文。比如 `mole` 可以是动物、化学单位、皮肤痣。Attention 允许模型为当前 token 计算一组权重，决定应该从哪些 token 获取信息。权重高的位置贡献更多，权重低的位置贡献更少。这样模型就能处理指代、修饰、长距离依赖、语义消歧等问题。

**面试官考察点：**  
是否理解 Attention 的本质是“动态加权信息聚合”，而不是简单说“关注重要词”。

**常见误区：**  
把 Attention 说成固定规则，例如“名词一定关注形容词”。真实模型中的注意力模式是训练学出来的，不是人工写死的语法规则。

**可追问方向：**  
Attention 和 RNN 的隐藏状态压缩有什么区别？

**可追问参考答案：**  

- 标准版：RNN 通常把历史信息递归压缩到一个隐藏状态里，远距离信息可能逐步衰减；Attention 允许当前位置直接对上下文中的多个位置计算权重并聚合信息，信息路径更短。  
- 口语版：RNN 更像一路传话，传得越远越容易丢信息；Attention 更像当前词可以直接翻前面所有词，觉得哪个重要就重点看哪个。

## Attention 2. Self-Attention 和普通 Attention / Cross-Attention 有什么区别？

**标准回答：**  
Self-Attention 的 Query、Key、Value 都来自同一个序列。Cross-Attention 的 Query 来自一个序列，Key 和 Value 来自另一个序列。

**口语化回答：**  
Self-Attention 就是“一句话内部自己看自己”；Cross-Attention 是“一个序列去看另一个序列”。比如翻译时，英文生成要看中文原文，这就是 Cross-Attention。

**详细解释：**  
Self-Attention 常用于让一句话内部的 token 互相建模。比如 GPT 中每个 token 根据前文更新自己的表示。Cross-Attention 常见于 Encoder-Decoder 结构，比如翻译任务中，Decoder 生成目标语言时用 Query 去关注 Encoder 输出的源语言表示。

| 类型 | Query 来源 | Key / Value 来源 | 常见场景 |
|---|---|---|---|
| Self-Attention | 同一序列 | 同一序列 | BERT、GPT、Transformer Encoder |
| Cross-Attention | 目标序列或解码端 | 源序列或编码端 | 翻译、图文生成、Encoder-Decoder |

**面试官考察点：**  
是否能从 Q/K/V 来源解释区别。

**常见误区：**  
认为 Cross-Attention 是“更复杂的 Self-Attention”。其实关键区别是信息来源不同。

**可追问方向：**  
GPT 主要使用哪种 Attention？T5 或原始 Transformer 翻译模型使用哪些 Attention？

**可追问参考答案：**  

- 标准版：GPT 主要使用 masked self-attention。T5 和原始 Encoder-Decoder Transformer 同时使用 Encoder self-attention、Decoder masked self-attention 和 Decoder 到 Encoder 的 cross-attention。  
- 口语版：GPT 基本是在自己的上下文里往前看；T5 或翻译模型更像一边读输入，一边生成输出，生成时还会回头看输入内容。

## Attention 3. Query、Key、Value 分别是什么？为什么要拆成这三个向量？

**标准回答：**  
Query 表示当前 token 想找什么信息，Key 表示每个 token 能被怎样匹配，Value 表示真正被传递和聚合的内容。拆成三者可以把“匹配关系”和“传递内容”分开建模。

**口语化回答：**  
大白话就是：Query 是“我想找啥”，Key 是“我有什么标签能被你找到”，Value 是“你找到我之后，我真正给你什么内容”。Q 和 K 负责算谁跟谁相关，V 才是真正拿来更新信息的东西。

**详细解释：**  
每个输入向量 `X` 会经过三个可训练矩阵得到：

```text
Q = XW_Q
K = XW_K
V = XW_V
```

`QK^T` 用于计算相关性分数，Softmax 后得到注意力权重。然后用这些权重对 `V` 加权求和，得到当前 token 的上下文更新。

**面试官考察点：**  
是否知道 Q/K 负责算权重，V 负责提供内容。

**常见误区：**  
把 Key 和 Value 都说成“被关注的词”，没有区分匹配索引和内容载体。

**可追问方向：**  
为什么不直接用原始 embedding 做 Q/K/V？

**可追问参考答案：**  
- 标准版：用不同的可训练投影矩阵可以让模型在不同子空间里分别学习“查询方式”“匹配方式”和“内容表示”，表达能力更强。  
- 口语版：原始 embedding 太通用了。模型需要把同一个词从不同角度重新加工一下：一份用来提问，一份用来匹配，一份用来传内容。

## Attention 4. Scaled Dot-Product Attention 的公式是什么？每一步在做什么？

**标准回答：**  
公式是：

```text
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V
```

`QK^T` 计算 query 和 key 的匹配分数，除以 `sqrt(d_k)` 做缩放，Softmax 转成权重分布，再乘以 `V` 得到加权聚合结果。

**口语化回答：**  
这公式可以读成一句话：先用 Q 和 K 算“谁该看谁”，再把分数变成比例，最后按比例去拿 V 里的内容。

**详细解释：**  
假设序列长度为 `n`，每个 head 的 key/query 维度为 `d_k`。`QK^T` 会得到 `n × n` 的分数矩阵。每一行或每一列表示某个 token 对其他 token 的关注程度，具体取决于实现中的矩阵排列。Softmax 让分数变成概率式权重，再用权重混合 Value。

**面试官考察点：**  
公式、维度、每一步语义是否清楚。

**常见误区：**  
只背公式，不知道 `QK^T` 和 `V` 分别承担什么功能。

**可追问方向：**  
如果不做 Softmax 会怎样？

**可追问参考答案：**  

- 标准版：不做 Softmax 时，原始分数不能形成稳定的非负归一化权重，Value 聚合会缺少概率式权重解释，数值也可能不稳定。  
- 口语版：不做 Softmax，就像没有把“关注程度”换成比例，模型不知道到底该按几成力度去拿每个词的信息。

## Attention 5. 为什么 Attention 里要对 `QK^T` 除以 `sqrt(d_k)`？

**标准回答：**  
因为当维度 `d_k` 较大时，点积结果的方差会变大，Softmax 容易进入饱和区，导致梯度变小、训练不稳定。除以 `sqrt(d_k)` 可以缩放分数，稳定训练。

**口语化回答：**  
维度一大，点积算出来的分数可能特别大。分数太大，Softmax 就会变得很极端，几乎只看一个词，训练不稳定。所以要除一下，把分数压回比较合适的范围。

**详细解释：**  
如果 Q 和 K 的每个分量近似独立，点积是很多项相加。维度越高，点积数值范围越容易变大。过大的 logits 经过 Softmax 后会变得非常尖锐，某个位置接近 1，其他位置接近 0，模型早期训练会很困难。

**面试官考察点：**  
是否理解缩放不是为了改变语义，而是为了数值稳定和梯度稳定。

**常见误区：**  
说成“为了让概率和为 1”。概率和为 1 是 Softmax 的作用，不是缩放项的作用。

**可追问方向：**  
Softmax 饱和会对梯度造成什么影响？

**可追问参考答案：**  

- 标准版：Softmax 饱和时输出接近 one-hot，很多位置的梯度会非常小，模型难以调整注意力分布，训练变慢或不稳定。  
- 口语版：Softmax 一旦太极端，就像模型太早认死理，只盯一个位置，其他位置几乎没机会学了。

## Attention 6. Softmax 在 Attention 中起什么作用？

**标准回答：**  
Softmax 把原始 attention scores 匹配分数转换成非负且总和为 1 的权重分布，用于对 Value 做加权求和。

**口语化回答：**  
Softmax 就是把一堆“相关性分数”变成“关注比例”。比如这个词看 70%，那个词看 20%，其他词看 10%，然后按这个比例拿信息。

**详细解释：**  
Attention scores 可以是任意实数。Softmax 会放大相对高分，压低相对低分，使模型形成“主要关注哪些 token”的分布。之后这些权重乘以 Value 向量，得到上下文表示。

**面试官考察点：**  
是否知道 Softmax 的输入是分数，输出是权重，不是最终 token 概率。

**常见误区：**  
把 attention 中的 Softmax 和语言模型输出层的 Softmax 混为一谈。前者是位置权重，后者是词表概率。

**可追问方向：**  
Attention 权重是否一定稀疏？

**可追问参考答案：**  
- 标准版：不一定。Softmax 输出通常是稠密分布，只是某些位置权重可能很小。是否稀疏取决于分数分布和具体 attention 变体。  
- 口语版：不一定只看几个词。很多时候它是每个词都看一点，只是有的看得多，有的看得很少。

## Attention 7. 什么是 Attention Weight / Attention Pattern？它能直接解释模型为什么这么回答吗？

**标准回答：**  
Attention Weight 是 Softmax 后的注意力权重，Attention Pattern 是所有 token 之间权重组成的矩阵。它能提供一定解释线索，但不能完全等同于模型决策原因。

**口语化回答：**  
Attention Pattern 就像一张“谁看谁、看多少”的表。它能帮我们猜模型在关注什么，但不能直接说模型就是因为这个才这么回答，因为模型后面还有很多层、很多 head、还有 MLP。

**详细解释：**  
Attention Pattern 可以显示某个 token 在某一层某个 head 中关注了哪些位置。但 Transformer 还有多层、多头、MLP、残差连接等结构。一个 head 的权重只是模型计算的一小部分。因此它有解释价值，但不是完整因果解释。

**面试官考察点：**  
是否具备可解释性边界意识。

**常见误区：**  
看到高 attention weight 就断言“模型就是因为这个词才回答”。这通常过度简化。

**可追问方向：**  
如何更严谨地分析某个 head 是否重要？

**可追问参考答案：**  
- 标准版：可以通过 ablation、head pruning、激活替换、注意力干预、性能变化评估等方法判断某个 head 对输出的因果影响。  
- 口语版：不能只看热力图，要试着把这个 head 去掉或改掉，看模型表现是不是真的变差，这样才更靠谱。

## Attention 8. 为什么 Decoder 或 GPT 类模型需要 Masked Self-Attention？

**标准回答：**  
因为自回归生成只能根据过去 token 预测未来 token。Masked Self-Attention 防止当前位置看到后面的 token，避免训练时答案泄漏。

**口语化回答：**  
GPT 是从左到右写字的。它预测下一个词时，不能提前偷看后面的正确答案。所以要加 mask，把未来的词挡住。

**详细解释：**  
GPT 训练目标是预测下一个 token。如果预测第 `t` 个位置时能看到第 `t+1` 个及之后的 token，那模型就相当于偷看答案。Causal mask 会把未来位置的 attention score 设为负无穷，Softmax 后权重为 0。

**面试官考察点：**  
是否理解训练和推理一致性。

**常见误区：**  
认为 mask 是为了减少计算量。它主要是为了保证因果约束，不是标准意义上的加速。

**可追问方向：**  
BERT 为什么不使用 causal mask？

**可追问参考答案：**  
- 标准版：BERT 是 encoder-only 模型，训练目标通常是 masked language modeling，需要利用左右双向上下文预测被遮住的 token，因此不使用 causal mask。  
- 口语版：BERT 不是从左到右生成，它更像做完形填空，可以看左右两边，所以不需要挡住未来词。

## Attention 9. Causal Mask 和 Padding Mask 有什么区别？

**标准回答：**  
Causal Mask 用于阻止当前位置关注未来位置。Padding Mask 用于阻止模型关注补齐用的 padding token。

**口语化回答：**  
Causal Mask 是防止“偷看未来答案”；Padding Mask 是告诉模型“这些只是补齐长度的空位，别理它们”。

**详细解释：**  
Causal Mask 常见于 GPT 这类自回归模型，是三角矩阵形式。Padding Mask 常见于批处理时，因为不同句子长度不同，需要补齐到同一长度，模型不应把 `<pad>` 当作有效内容。

| Mask 类型 | 作用 | 常见场景 |
|---|---|---|
| Causal Mask | 禁止看未来 | GPT、Decoder Self-Attention |
| Padding Mask | 忽略补齐 token | Encoder、Decoder、批处理 |

**面试官考察点：**  
是否能区分“因果约束”和“无效 token 屏蔽”。

**常见误区：**  
把所有 mask 都说成“防止看到未来”。

**可追问方向：**  
Encoder-Decoder Transformer 中哪些 attention 需要哪些 mask？

**可追问参考答案：**  

- 标准版：Encoder self-attention 通常需要 padding mask；Decoder self-attention 需要 causal mask 和 padding mask；Decoder cross-attention 通常需要对 encoder 侧 padding 做 mask。  
- 口语版：Encoder 主要是不看补齐空位；Decoder 自己生成时既不能看未来，也不能看空位；Decoder 看 Encoder 时也要避开 Encoder 里的空位。

## Attention 10. Multi-Head Attention 相比 Single-Head Attention 有什么优势？

**标准回答：**  
Multi-Head Attention 允许模型在多个子空间中并行学习不同的关系模式，比如语法关系、指代关系、位置关系和语义相关性，表达能力更强。

**口语化回答：**  
一个 head 就像一种观察角度，多头就是同时从多个角度看句子。有的 head 可能看语法，有的看指代，有的看位置关系，最后把这些信息合起来。

**详细解释：**  
单个 head 只能形成一套注意力分布。多个 head 各自有不同的 `W_Q`、`W_K`、`W_V`，可以从不同角度建模序列。最后多个 head 的输出拼接并通过 `W_O` 混合回模型维度。

**面试官考察点：**  
是否能说出多头的核心是“多个投影子空间 + 多种关系并行建模”。

**常见误区：**  
说“head 越多一定越好”。head 数量需要和模型维度、训练数据、计算预算匹配。

**可追问方向：**  
多头输出如何合并？

**可追问参考答案：**  
- 标准版：每个 head 输出一个子空间表示，多个 head 的输出通常在特征维度拼接，然后经过输出投影矩阵 `W_O` 映射回模型维度。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
- 口语版：每个 head 先各算各的，算完把结果拼起来，再用一个矩阵把它们融合成模型需要的维度。

## Attention 11. 多个 Attention Head 是否一定分别学到了不同的人类可解释规则？

**标准回答：**  
不一定。有些 head 可能学到可解释模式，比如关注前一个词、标点或实体；有些 head 可能冗余，或学习到人类不容易命名的统计模式。

**口语化回答：**  
不能简单说一个 head 就对应一条语法规则。有些 head 看起来挺好解释，有些 head 可能只是配合别的层工作，甚至有些去掉影响也不大。

**详细解释：**  
可解释性研究发现，一些 head 具有明显功能，但并不是所有 head 都重要或可解释。有些模型中剪掉部分 head 后性能变化不大。这说明 multi-head 的作用不能简单理解为“每个 head 对应一个语法规则”。

**面试官考察点：**  
是否能避免过度拟人化解释。

**常见误区：**  
把教学图里的“一个 head 处理形容词修饰名词”当成真实模型固定结构。

**可追问方向：**  
如何判断某个 attention head 是否冗余？

**可追问参考答案：**  

- 标准版：可以通过剪枝、消融实验、观察验证集性能变化、分析激活和注意力模式等方式判断。若移除后性能几乎不变，可能说明该 head 冗余或作用较小。  
- 口语版：最直接就是把它关掉试试，如果模型效果基本没变，那这个 head 可能没那么关键。

## Attention 12. Attention 的时间复杂度和空间复杂度是多少？为什么长上下文很贵？

**标准回答：**  
标准 Self-Attention 对序列长度 `n` 的时间和空间复杂度通常是 `O(n^2)`，因为要计算所有 token 两两之间的注意力分数。

**口语化回答：**  
每个词都要和其他词算一遍关系，所以长度一长，关系表会变得特别大。不是多几个词那么简单，而是成平方增长。

**详细解释：**  
`QK^T` 会产生一个 `n × n` attention score 矩阵。序列越长，矩阵越大。上下文长度从 4k 增加到 8k，注意力矩阵大小约变成 4 倍。这就是长上下文模型在显存和计算上昂贵的原因之一。

**面试官考察点：**  
是否知道瓶颈来自 token 两两交互。

**常见误区：**  
只说“Transformer 很耗算力”，但说不出 `n^2` 的来源。

**可追问方向：**  
有哪些降低 attention 复杂度的方法？

**可追问参考答案：**  

- 标准版：常见方法包括 sparse attention、local attention、linear attention、sliding window attention、FlashAttention、KV cache，以及检索增强或上下文压缩等工程方案。  
- 口语版：思路就是别让所有词都互相看，或者把计算做得更省内存、更快，比如只看附近、只看重要位置，或者用 FlashAttention 优化实现。

## Attention 13. 如果输入序列长度翻倍，标准 Self-Attention 的计算量大约如何变化？

**标准回答：**  
大约变为 4 倍，因为标准 Self-Attention 的主要复杂度与序列长度平方成正比。

**口语化回答：**  
长度翻倍，不是算力翻倍，而是大概翻四倍。因为每个 token 都要和更多 token 两两配对。

**详细解释：**  
长度为 `n` 时 attention score 是 `n × n`，长度变成 `2n` 后变成 `2n × 2n = 4n^2`。这也是为什么长上下文窗口扩展会迅速增加计算和显存压力。

**面试官考察点：**  
是否能把复杂度和实际上下文窗口成本联系起来。

**常见误区：**  
认为长度翻倍只会让计算翻倍。

**可追问方向：**  
KV Cache 能否降低训练时 self-attention 的 `O(n^2)` 成本？

**可追问参考答案：**  
- 标准版：KV Cache 主要用于自回归推理，缓存历史 Key/Value，避免每生成一个 token 都重新计算全部历史表示；它通常不改变训练阶段标准 full attention 的 `O(n^2)` 复杂度。  
- 口语版：KV Cache 是推理加速用得多，主要避免生成时反复算旧内容；训练时整段序列一起算，问题不太一样。

## Attention 14. Attention 中的 Value 向量到底传递了什么？它和 Key 的区别是什么？

**标准回答：**  
Key 用来和 Query 计算匹配权重，Value 是被这些权重加权求和后真正传递给目标 token 的内容。

**口语化回答：**  
Key 像标签，负责“能不能被找到”；Value 像正文，负责“找到以后给你什么”。算相关性看 Key，真正拿信息看 Value。

**详细解释：**  
可以把 Key 看成“索引”，Value 看成“内容”。当某个 token 的 Key 与当前 token 的 Query 匹配度高时，它对应的 Value 会以较大权重参与聚合。模型通过训练决定 Value 空间中应该编码哪些信息。

**面试官考察点：**  
是否能说清楚“匹配”和“内容传递”的分工。

**常见误区：**  
把 Key 和 Value 都解释成同一个东西。

**可追问方向：**  
如果 Q、K、V 都来自同一输入，为什么还要用三个不同矩阵？

**可追问参考答案：**  
- 标准版：虽然来源相同，但不同投影矩阵让模型可以在不同表示空间中分别学习查询、匹配和内容传递，提高表达能力。  
- 口语版：同一个词要扮演不同角色，所以要换不同“滤镜”：一个滤镜用来问，一个用来被匹配，一个用来传信息。

## Attention 15. 为什么说 Attention 可以帮助模型处理长距离依赖？

**标准回答：**  
因为 Self-Attention 允许任意两个位置直接计算相关性并交换信息，不需要像 RNN 那样沿时间步一步步传递。

**口语化回答：**  
Attention 里，后面的词可以直接去看很前面的词，不用中间一层层传话。所以开头的信息更容易影响到后面。

**详细解释：**  
在 RNN 中，早期信息要经过许多时间步才能影响后面位置，容易衰减。Attention 中后面的 token 可以直接关注很前面的 token。如果一句话最后的代词指代开头的实体，attention 可以直接建立联系。

**面试官考察点：**  
是否理解路径长度更短。

**常见误区：**  
认为 Attention 可以无限处理长文本。它仍受上下文窗口和 `O(n^2)` 成本限制。

**可追问方向：**  
长距离依赖和长上下文窗口是一回事吗？

**可追问参考答案：**  
- 标准版：不是。长距离依赖指模型能利用相隔很远的信息；长上下文窗口只是模型可见 token 范围更长。可见范围更长不代表一定能可靠利用远处信息。  
- 口语版：窗口长只是“看得到”，长距离依赖是“用得上”。看得到很多东西，不代表每次都能抓住重点。

## Attention 16. Attention 和 RNN 处理上下文的方式有什么不同？

**标准回答：**  
RNN 按顺序递归处理 token，把历史压缩进隐藏状态；Attention 一次性比较序列中各位置，通过权重动态聚合相关信息。

**口语化回答：**  
RNN 是一个词一个词往后传，像接力；Attention 是整句话摊开来，每个词都可以直接看其他词，像开卷查资料。

**详细解释：**  
RNN 的计算天然依赖前一个时间步，难以充分并行。Attention 可以对整段输入并行计算 Q/K/V 和注意力矩阵，更适合 GPU。RNN 的历史信息存在压缩瓶颈，Attention 则能直接访问上下文窗口内的各个位置。

**面试官考察点：**  
是否能从信息路径和并行性两个角度回答。

**常见误区：**  
只说 Transformer “更先进”，没有说明机制差异。

**可追问方向：**  
RNN 是否完全没有优势？

**可追问参考答案：**  
- 标准版：不是。RNN 在流式处理、低资源场景、小模型和某些实时序列任务中仍可能有优势，计算和内存模式也不同。  
- 口语版：RNN 不是废了，它结构简单，做一些实时、小规模、一步步来的任务可能还挺合适。

## Attention 17. 在一句话中，一个 token 是如何通过 Attention 吸收其他 token 信息的？

**标准回答：**  
当前 token 生成 Query，所有 token 生成 Key 和 Value。当前 Query 与所有 Key 计算分数，Softmax 得到权重，再用权重对所有 Value 加权求和，得到上下文更新。

**口语化回答：**  
比如 `blue creature` 里，`creature` 会问“哪些词在描述我？”如果 `blue` 匹配度高，那 `blue` 的信息就会更多加到 `creature` 的表示里。

**详细解释：**  
例如 `blue creature` 中，`creature` 的 Query 可能与 `blue` 的 Key 匹配度高，于是 `blue` 的 Value 对 `creature` 的更新贡献大。更新后，`creature` 的表示不再只是“生物”，而更接近“蓝色生物”。

**面试官考察点：**  
是否能把公式和语义例子对应起来。

**常见误区：**  
认为只有相邻词能互相影响。Self-Attention 中窗口内任意位置都可以互相影响，GPT 中还受 causal mask 限制。

**可追问方向：**  
为什么 GPT 中后面的 token 不能反过来更新前面的 token？

**可追问参考答案：**  

- 标准版：GPT 是自回归模型，当前位置只能依赖过去和当前位置。如果后面的 token 影响前面位置，会造成未来信息泄漏，训练目标和推理过程不一致。  
- 口语版：GPT 写东西时后面的词还没生成出来，所以训练时也不能让它提前看后面的词，不然就是作弊。

## Attention 18. Cross-Attention 常见于哪些模型结构或任务？

**标准回答：**  
Cross-Attention 常见于 Encoder-Decoder 模型、机器翻译、摘要、图文生成、语音文本对齐等任务。

**口语化回答：**  
Cross-Attention 常用在“一个东西要参考另一个东西”的场景，比如翻译时英文生成要看中文原文，图文模型生成文字时要看图片特征。

**详细解释：**  
在翻译中，Encoder 处理源语言，Decoder 生成目标语言。Decoder 的 Query 会关注 Encoder 输出的 Key/Value，从源句中提取相关信息。图文模型中，文本生成端也可能通过 Cross-Attention 关注图像特征。

**面试官考察点：**  
是否知道 Cross-Attention 用于跨序列或跨模态信息融合。

**常见误区：**  
认为所有 Transformer 都必须有 Cross-Attention。GPT 这类 decoder-only 模型通常没有标准 encoder-decoder cross-attention。

**可追问方向：**  
Stable Diffusion 中 Cross-Attention 大致起什么作用？

**可追问参考答案：**  
- 标准版：在文本条件图像生成中，Cross-Attention 常用于让图像生成过程中的 latent features 关注文本编码表示，从而把 prompt 中的语义约束注入图像生成。  
- 口语版：它就是让生成图片的过程不断参考文字提示，比如“红色汽车”“雪山背景”这些信息能影响画面。

## Attention 19. Attention 机制有哪些局限性？

**标准回答：**  
主要局限包括 `O(n^2)` 复杂度、长上下文成本高、attention weight 不等同于完整解释、可能存在冗余 head、对位置顺序本身不敏感，需要额外位置编码。

**口语化回答：**  
Attention 很强，但不是没有代价。最大问题就是长文本太贵，因为词和词要两两算关系。另外它本身不懂顺序，还得靠位置编码。

**详细解释：**  
标准 Self-Attention 对序列长度平方增长，长文本成本高。Attention 本身对集合顺序近似不敏感，如果没有位置编码，模型很难区分词序。并且注意力热图只能解释一部分计算过程，不能完整说明模型行为。

**面试官考察点：**  
是否能全面看待技术优缺点。

**常见误区：**  
只谈优点，不知道复杂度和位置建模问题。

**可追问方向：**  
FlashAttention、Sparse Attention、Linear Attention 分别想解决什么？

**可追问参考答案：**  
- 标准版：FlashAttention 主要优化标准 attention 的显存访问和计算效率；Sparse Attention 通过稀疏连接减少注意力计算；Linear Attention 尝试把复杂度从平方级降低到线性或近线性。  
- 口语版：FlashAttention 是把同样的活干得更快更省内存；Sparse 是少算一些关系；Linear 是想从根上把平方复杂度降下来。

## Attention 20. 请把 Attention 机制和 Transformer 的整体结构联系起来说明。

**标准回答：**  
Attention 是 Transformer 的核心模块之一。Transformer 通过多层 Multi-Head Self-Attention 让 token 之间交换信息，再通过 MLP 对每个位置的表示做非线性变换，并配合残差连接、LayerNorm 和位置编码形成完整架构。

**口语化回答：**  
Attention 是 Transformer 里负责“词和词之间交流”的部分。但 Transformer 不只有 Attention，还有 MLP、残差、LayerNorm、位置编码这些东西一起配合，才能变成完整模型。

**详细解释：**  
Attention 负责“位置之间的信息交流”，MLP 负责“每个位置内部的特征加工”。Embedding 把 token 变成向量，位置编码加入顺序信息，多层 attention 和 MLP 不断更新上下文表示，最后通过线性层和 Softmax 输出词表概率。

**面试官考察点：**  
是否能从局部机制上升到整体架构。

**常见误区：**  
把 Transformer 等同于 Attention。Transformer 还包括 MLP、残差、归一化、位置编码、输出层等组件。

**可追问方向：**  
为什么原论文叫 Attention Is All You Need，但 Transformer 里还有 FFN 和 LayerNorm？

**可追问参考答案：**  
- 标准版：标题强调 attention 替代循环和卷积成为序列建模的核心机制，但完整 Transformer 仍需要 FFN 提供非线性特征变换，LayerNorm 和残差连接保证训练稳定。  
- 口语版：这个标题是在说核心创新是 Attention，不是说模型里真的只剩 Attention。其他模块还是很重要，负责加工特征和稳定训练。

---

## 四、答案区：Transformer 20 题

## Transformer 1. Transformer 是什么？它和传统 RNN / LSTM 最大的区别是什么？

**标准回答：**  
Transformer 是一种基于 Self-Attention 的神经网络架构。它和 RNN / LSTM 最大区别是：Transformer 不按时间步递归处理序列，而是通过 attention 并行建模序列中 token 之间的关系。

**口语化回答：**  
Transformer 可以理解成一种特别适合处理序列的模型。它不像 RNN 那样一个词一个词往后传，而是把整句话摊开，让每个词直接去看其他词，所以并行性更好，也更容易处理长距离关系。

**详细解释：**  
RNN / LSTM 逐 token 处理，后一个状态依赖前一个状态。Transformer 对整段序列同时计算 Q/K/V 和 attention 矩阵，因此训练并行度更高，更适合大规模数据和 GPU。它还能更直接地捕捉长距离依赖。

**面试官考察点：**  
是否能抓住 Self-Attention、并行训练、长距离依赖三个关键词。

**常见误区：**  
只说 Transformer “更快更强”，但没有解释原因。

**可追问方向：**  
Transformer 为什么仍需要位置编码？

**可追问参考答案：**  
- 标准版：Self-Attention 本身主要建模 token 间相关性，对顺序没有天然感知。位置编码提供序列位置信息，使模型能区分不同词序。  
- 口语版：Attention 只知道词和词的关系，但不天然知道谁在前谁在后，所以要额外告诉它位置。

## Transformer 2. Transformer 的基本结构由哪些核心模块组成？

**标准回答：**  
核心模块包括 token embedding、位置编码、多头自注意力、前馈网络 MLP / FFN、残差连接、LayerNorm，以及最终输出投影和 Softmax。

**口语化回答：**  
Transformer 大概就是：先把词变成向量，加上位置信息，然后一层层做 Attention 和 MLP。Attention 负责词之间交流，MLP 负责加工每个词自己的表示，中间用残差和归一化让训练更稳定。

**详细解释：**  
一个 Transformer block 通常包含 Multi-Head Attention 和 Feed Forward Network。每个子层周围有残差连接和 LayerNorm。多层 block 堆叠后，模型逐步形成更复杂的上下文表示。

**面试官考察点：**  
是否知道 Transformer 不是只有 Attention。

**常见误区：**  
漏掉残差连接、LayerNorm 或 FFN。

**可追问方向：**  
Encoder block 和 Decoder block 在 attention 上有什么不同？

**可追问参考答案：**  
- 标准版：Encoder block 通常使用双向 self-attention；Decoder block 使用 masked self-attention，并在 encoder-decoder 架构中额外使用 cross-attention。  
- 口语版：Encoder 可以看完整输入；Decoder 生成时不能看未来。如果是翻译模型，Decoder 还要回头看 Encoder 读完的原文。

## Transformer 3. 为什么 Transformer 需要 Positional Encoding 或 Position Embedding？

**标准回答：**  
因为 Self-Attention 本身不包含序列顺序信息。如果不加入位置编码，模型很难区分 “猫追狗” 和 “狗追猫” 这种词相同但顺序不同的句子。

**口语化回答：**  
Attention 只看词之间怎么相关，但它自己不太知道词的先后顺序。所以要给每个词加一个“位置标签”，告诉模型这是第几个词。

**详细解释：**  
Self-Attention 主要基于 token 之间的向量匹配，对排列顺序本身没有天然感知。位置编码给每个 token 加入位置信息，使模型能利用顺序、距离、相对位置等信号。

**面试官考察点：**  
是否理解 permutation-invariant / permutation-equivariant 问题。

**常见误区：**  
认为 token 在数组里有顺序，模型自然就知道顺序。矩阵计算需要显式或隐式位置特征。

**可追问方向：**  
绝对位置编码和相对位置编码有什么差异？

**可追问参考答案：**  
- 标准版：绝对位置编码表示 token 在序列中的具体位置；相对位置编码更关注两个 token 之间的相对距离或相对顺序，通常更适合泛化到不同长度。  
- 口语版：绝对位置像“我是第 5 个词”；相对位置像“我离你前面 3 个词”。

## Transformer 4. Sinusoidal Positional Encoding 和 Learned Position Embedding 有什么区别？

**标准回答：**  
Sinusoidal Positional Encoding 是固定的正弦余弦函数编码，不需要训练参数；Learned Position Embedding 是可训练的位置向量，由模型从数据中学习。

**口语化回答：**  
Sinusoidal 是提前设计好的位置编码，模型不用学；Learned 是给每个位置一个可训练向量，让模型自己学怎么表示位置。

**详细解释：**  
原始 Transformer 使用正弦余弦位置编码，优点是可以一定程度外推到更长位置。Learned Position Embedding 更灵活，但通常受训练时最大长度限制。现代模型还常使用 RoPE、ALiBi 等位置方法。

**面试官考察点：**  
是否知道固定位置编码和可学习位置编码的取舍。

**常见误区：**  
认为所有 Transformer 都使用原论文的 sinusoidal encoding。

**可追问方向：**  
RoPE 为什么在 LLM 中常见？

**可追问参考答案：**  
- 标准版：RoPE 通过旋转位置编码把相对位置信息注入到 query 和 key 中，适合 attention 计算，并在长上下文和相对位置建模中表现较好。  
- 口语版：RoPE 不只是给词加个位置标签，而是把位置信息融进 Q 和 K 的匹配过程里，所以 LLM 很爱用。

## Transformer 5. Transformer Encoder 和 Decoder 的结构有什么不同？

**标准回答：**  
Encoder 主要包含双向 Self-Attention 和 FFN；Decoder 包含 Masked Self-Attention、可选 Cross-Attention 和 FFN。Decoder 需要 causal mask 来防止看到未来 token。

**口语化回答：**  
Encoder 像读文章，可以把整段输入都看完；Decoder 像写文章，只能看已经写出来的内容，不能偷看未来。如果是翻译模型，Decoder 还会去参考 Encoder 读到的原文。

**详细解释：**  
原始 Transformer 翻译模型中，Encoder 读入源序列，Decoder 生成目标序列。Decoder 先对已生成目标序列做 masked self-attention，再通过 cross-attention 关注 Encoder 输出。

**面试官考察点：**  
是否能说明 decoder 的 mask 和 cross-attention。

**常见误区：**  
认为 Encoder 和 Decoder 只是层数不同。

**可追问方向：**  
GPT 为什么可以只用 Decoder？

**可追问参考答案：**  
- 标准版：GPT 的任务是自回归文本生成，只需要根据已有上下文预测下一个 token。Masked self-attention 的 decoder-only 结构天然匹配这个训练和推理方式。  
- 口语版：GPT 就是一路往后写，它不需要先单独读一个源句再翻译，所以只用 Decoder 这套从左到右生成的结构就够了。

## Transformer 6. Encoder-only、Decoder-only、Encoder-Decoder 模型分别适合什么任务？

**标准回答：**  
Encoder-only 适合理解类任务，Decoder-only 适合生成类任务，Encoder-Decoder 适合输入到输出的转换任务。

**口语化回答：**  
简单记：BERT 这种 Encoder-only 更会“理解”；GPT 这种 Decoder-only 更会“生成”；T5 这种 Encoder-Decoder 更像“读完输入再写输出”。

**详细解释：**

| 架构 | 代表模型 | 适合任务 |
|---|---|---|
| Encoder-only | BERT | 分类、检索、抽取、句子理解 |
| Decoder-only | GPT | 文本生成、对话、代码生成 |
| Encoder-Decoder | T5、原始 Transformer | 翻译、摘要、问答生成 |

**面试官考察点：**  
是否能把架构和任务目标对应起来。

**常见误区：**  
认为 BERT 和 GPT 只是训练数据不同，忽略架构和训练目标差异。

**可追问方向：**  
为什么 BERT 不适合直接自回归生成？

**可追问参考答案：**  
- 标准版：BERT 使用双向上下文和 masked language modeling 训练，不具备从左到右逐 token 生成的因果约束和训练目标，因此不天然适合自回归生成。  
- 口语版：BERT 更像做完形填空，不是一路往后写文章的模型，所以直接拿它生成长文本不顺手。

## Transformer 7. GPT 和 BERT 在 Transformer 架构和训练目标上有什么区别？

**标准回答：**  
GPT 是 decoder-only，自回归预测下一个 token，使用 causal mask；BERT 是 encoder-only，使用双向上下文，常用 masked language modeling 训练。

**口语化回答：**  
GPT 是从左到右写，适合生成；BERT 是左右一起看，适合理解。GPT 预测下一个词，BERT 更像把句子里挖掉的词补回来。

**详细解释：**  
GPT 只能看当前位置之前的 token，因此适合从左到右生成文本。BERT 可以同时看左右上下文，适合理解任务，但不能天然逐 token 生成长文本。训练目标不同导致它们的应用重点不同。

**面试官考察点：**  
是否理解“单向生成”和“双向理解”的差异。

**常见误区：**  
说 GPT 是“生成式”，BERT 是“分类式”，但说不出 causal mask 和 MLM。

**可追问方向：**  
为什么 GPT 可以做分类任务，BERT 也可以做问答？

**可追问参考答案：**  
- 标准版：模型架构决定倾向，但下游任务可以通过 prompt、微调、分类头或任务格式转换来适配。GPT 可以把分类转成生成标签，BERT 可以通过 span prediction 或分类头做问答。  
- 口语版：不是说 GPT 只能写文章、BERT 只能分类。很多任务可以换个形式做，比如让 GPT 输出类别，或者给 BERT 接个分类头。

## Transformer 8. Transformer 中 Feed Forward Network / MLP 的作用是什么？

**标准回答：**  
FFN / MLP 对每个 token 位置的表示独立进行非线性变换，增强模型表达能力。Attention 负责 token 间信息交互，MLP 负责对每个位置的特征进行加工。

**口语化回答：**  
Attention 负责让词和词交流，MLP 负责把每个词当前拿到的信息再加工一下。它不负责看别的词，但负责把这个位置的表示变得更有用。

**详细解释：**  
典型 FFN 是两层线性层加激活函数，先升维再降维。它不在不同位置之间交换信息，但会对每个位置的上下文表示进行复杂变换。很多 LLM 参数其实主要在 MLP 中。

**面试官考察点：**  
是否能区分 Attention 和 MLP 的职责。

**常见误区：**  
认为 Transformer 的所有能力都来自 Attention，忽略 MLP 的重要性。

**可追问方向：**  
为什么 FFN 通常会先升维？

**可追问参考答案：**  
- 标准版：升维可以提供更大的中间表示空间和更强的非线性表达能力，随后再降回模型维度，形成丰富的特征变换。  
- 口语版：先升维就像给模型更大的草稿纸，让它能做更复杂的加工，算完再压回原来的维度。

## Transformer 9. 残差连接 Residual Connection 在 Transformer 中有什么作用？

**标准回答：**  
残差连接让子层学习对输入的增量更新，缓解梯度消失，帮助深层网络训练，并保留原始信息。

**口语化回答：**  
残差连接就是别把原来的信息直接丢掉，而是在原来的基础上加一点新变化。这样模型更容易训练，层数深了也不容易把信息弄没。

**详细解释：**  
子层输出通常写作：

```text
output = x + Sublayer(x)
```

这意味着模型不必每层都重建完整表示，而是在原表示上添加更新。对于深层 Transformer，残差连接是稳定训练的关键。

**面试官考察点：**  
是否理解残差连接对深层模型训练的重要性。

**常见误区：**  
只说“防止梯度消失”，但不知道它还保留信息、让层学习增量。

**可追问方向：**  
如果去掉残差连接，训练可能出现什么问题？

**可追问参考答案：**  
- 标准版：深层网络可能更难优化，梯度传播不稳定，早期信息难以保留，模型收敛变慢甚至无法有效训练。  
- 口语版：去掉残差后，模型每层都得重新改一遍信息，层数一深就容易训练崩，或者越传越丢东西。

## Transformer 10. LayerNorm 在 Transformer 中有什么作用？Pre-LN 和 Post-LN 有什么区别？

**标准回答：**  
LayerNorm 用于稳定激活分布和训练过程。Post-LN 是子层加残差后再归一化，Pre-LN 是先归一化再进子层。现代深层 Transformer 常偏向 Pre-LN，因为训练更稳定。

**口语化回答：**  
LayerNorm 就是帮每层的数值别飘得太厉害，让训练更稳。Pre-LN 是先整理一下再进子层，Post-LN 是子层算完加残差后再整理。大模型里 Pre-LN 更常见，因为深层训练更稳。

**详细解释：**  
Post-LN 原始写法类似：

```text
LayerNorm(x + Sublayer(x))
```

Pre-LN 写法类似：

```text
x + Sublayer(LayerNorm(x))
```

Pre-LN 中残差路径更直接，有利于梯度流动，尤其在很深的模型中更稳定。

**面试官考察点：**  
是否了解 Transformer 训练稳定性细节。

**常见误区：**  
把 LayerNorm 和 BatchNorm 混为一谈。LayerNorm 通常按单个样本的特征维度归一化，更适合序列模型。

**可追问方向：**  
LayerNorm 和 BatchNorm 有什么区别？

**可追问参考答案：**  
- 标准版：BatchNorm 通常在 batch 维度统计均值方差，依赖 batch 分布；LayerNorm 在单个样本的特征维度上归一化，更适合变长序列和小 batch 场景。  
- 口语版：BatchNorm 是看一批样本一起算，LayerNorm 是每个样本自己内部算。NLP 里句子长度和 batch 情况复杂，所以 LayerNorm 更顺手。

## Transformer 11. Transformer 为什么比 RNN 更容易并行训练？

**标准回答：**  
因为 Transformer 不需要按时间步递归计算隐藏状态，而是可以对整个序列同时计算 embedding、Q/K/V、attention 和 FFN。

**口语化回答：**  
RNN 必须一步接一步，前一步没算完后一步不能算。Transformer 可以把整句话一起丢进去做矩阵运算，所以 GPU 能同时干很多活。

**详细解释：**  
RNN 的第 `t` 步依赖第 `t-1` 步，训练时很难完全并行。Transformer 的 Self-Attention 对序列位置两两计算，可以通过矩阵乘法一次性完成，非常适合 GPU / TPU。

**面试官考察点：**  
是否能把架构特点和硬件效率联系起来。

**常见误区：**  
认为 Transformer 推理也总是完全并行。自回归生成时，token 仍需一个一个生成。

**可追问方向：**  
训练并行和推理并行有什么不同？

**可追问参考答案：**  
- 标准版：训练时有完整目标序列，可用 causal mask 并行计算多个位置的 loss；自回归推理时每个新 token 依赖前面已生成 token，因此生成过程通常是串行的。  
- 口语版：训练时答案都在，可以一起算；真正生成时，下一个词还没出来，只能一个一个往后写。

## Transformer 12. Transformer 如何从 token 得到最终的下一个 token 概率？

**标准回答：**  
文本先 tokenization，再查 embedding，加位置编码，经过多层 Transformer blocks，得到最后位置的隐藏向量。该向量经过输出投影到词表大小的 logits，再通过 Softmax 得到下一个 token 概率。

**口语化回答：**  
流程就是：文字先切成 token，token 变成向量，加上位置信息，经过很多层 Transformer 加工，最后拿最后一个位置的向量去给词表里每个 token 打分，再变成概率。

**详细解释：**

```text
文本
➡️ tokens
➡️ embeddings + positions
➡️ 多层 attention + MLP
➡️ final hidden state
➡️ unembedding / linear projection
➡️ logits
➡️ softmax
➡️ next token probability
```

生成时从概率分布中选择或采样一个 token，拼接回上下文，再重复过程。

**面试官考察点：**  
是否能完整串起 token、embedding、Transformer、logits、Softmax。

**常见误区：**  
把 attention 的 Softmax 和最终词表 Softmax 混淆。

**可追问方向：**  
temperature、top-k、top-p 会作用在哪一步？

**可追问参考答案：**  
- 标准版：这些采样策略作用在输出 logits 或 Softmax 概率分布阶段，用来控制从下一个 token 分布中选择 token 的随机性和候选范围。  
- 口语版：模型先给每个词打分，temperature、top-k、top-p 就是在“怎么从这些分数里选下一个词”这一步起作用。

## Transformer 13. Tokenization、Embedding、Unembedding 分别是什么？

**标准回答：**  
Tokenization 把文本切成 token；Embedding 把 token id 映射成向量；Unembedding 把最终隐藏向量映射回词表 logits。

**口语化回答：**  
Tokenization 是把文字切成模型能认识的小块；Embedding 是把这些小块变成数字向量；Unembedding 是最后再把向量变回对每个候选 token 的打分。

**详细解释：**  
Token 可以是词、子词、字符片段或标点。Embedding matrix 是一个可训练查表矩阵。Unembedding 通常是一个线性投影，把模型维度映射到词表大小。有些模型会共享 embedding 和 unembedding 权重。

**面试官考察点：**  
是否理解文本和神经网络数值计算之间的桥梁。

**常见误区：**  
认为 token 一定等于单词，中文和英文都不是这么简单。

**可追问方向：**  
为什么不同 tokenizer 会影响上下文长度和成本？

**可追问参考答案：**  
- 标准版：不同 tokenizer 对同一文本切分出的 token 数可能不同。token 数越多，占用上下文窗口越多，attention 计算和推理成本也越高。  
- 口语版：同一句话，有的 tokenizer 切得碎，有的切得少。切得越碎，就越占上下文，也更费算力。

## Transformer 14. Transformer 中参数主要分布在哪些部分？

**标准回答：**  
主要参数分布在 embedding / unembedding、Attention 的 Q/K/V/O 投影矩阵、FFN / MLP 的线性层，以及 LayerNorm 等少量参数中。大型 LLM 中 MLP 往往占很大比例。

**口语化回答：**  
参数主要在几类大矩阵里：词表 embedding、attention 里的 QKV 和输出投影，还有 MLP 里的升维降维矩阵。LayerNorm 也有参数，但相对很少。

**详细解释：**  
每层 Attention 有 `W_Q`、`W_K`、`W_V`、`W_O`。MLP 通常包含升维和降维两层大矩阵。词表较大时 embedding 和输出层也会很大。

**面试官考察点：**  
是否知道参数不是只在 attention 中。

**常见误区：**  
认为 Multi-Head Attention 是全部参数主体。实际很多模型的 FFN 参数更多。

**可追问方向：**  
为什么 MoE 模型会把 FFN 做成专家结构？

**可追问参考答案：**  
- 标准版：FFN 占据大量参数。MoE 将 FFN 扩展为多个专家，并通过路由选择少数专家激活，从而增加总参数容量但控制每次计算量。  
- 口语版：MLP 很吃参数，MoE 就是准备很多个 MLP 专家，但每次只叫几个来干活，这样容量大，计算不至于爆炸。

## Transformer 15. 为什么说 Transformer 是“可扩展”的架构？

**标准回答：**  
因为 Transformer 的核心计算是大规模矩阵乘法，容易并行化，训练稳定性较好，并且在模型规模、数据规模和算力增加时表现能持续提升。

**口语化回答：**  
Transformer 适合堆大，因为它的计算很适合 GPU，大部分都是矩阵乘法；再加上残差、LayerNorm 这些设计，层数和参数做大以后还比较能训起来。

**详细解释：**  
Transformer 不依赖递归结构，能充分利用 GPU / TPU。残差、LayerNorm、标准化的 block 堆叠方式也让它适合加深、加宽、扩大数据训练。这是现代 LLM 能扩展到大参数量的重要原因。

**面试官考察点：**  
是否能从算法和工程两方面理解 scaling。

**常见误区：**  
把可扩展简单理解为“参数可以变大”。还要考虑并行效率和训练稳定性。

**可追问方向：**  
Scaling law 大致说明了什么？

**可追问参考答案：**  
- 标准版：Scaling law 描述模型性能与参数量、数据量、计算量之间的经验关系，通常显示在合理配比下扩大规模可以带来可预测的性能提升。  
- 口语版：它大概是在说：模型、数据、算力按合适比例变大，效果往往会按比较稳定的规律变好。

## Transformer 16. Transformer 的上下文窗口 Context Window 是什么？它和模型记忆有什么区别？

**标准回答：**  
Context Window 是模型一次前向计算能处理的最大 token 数。它不是永久记忆，只是当前输入窗口内可见的信息范围。

**口语化回答：**  
上下文窗口就是模型这一次能看到多少 token。它不是长期记忆，只是你这次塞进输入里的内容，窗口外的东西模型默认看不到。

**详细解释：**  
如果上下文窗口是 8k tokens，模型只能直接利用这 8k tokens 内的信息。窗口之外的信息不会自动存在，除非通过检索、摘要、外部记忆或重新输入。长窗口也不保证模型一定能可靠使用所有信息。

**面试官考察点：**  
是否能区分上下文长度和长期记忆。

**常见误区：**  
认为上下文窗口越长，模型就“记忆越好”。窗口只是可见范围，不等于稳定记忆能力。

**可追问方向：**  
RAG 如何弥补上下文窗口限制？

**可追问参考答案：**  
- 标准版：RAG 通过外部检索系统从知识库中找到相关内容，并把检索结果放入当前上下文，让模型在有限窗口内利用外部信息。  
- 口语版：RAG 就像考试时先查资料，把最相关的资料塞给模型看，这样不用把所有知识都放进窗口里。

## Transformer 17. Transformer 在训练和推理时有什么差异？

**标准回答：**  
训练时通常可以并行处理完整序列并同时预测多个位置；自回归推理时需要一个 token 一个 token 生成。推理中常用 KV Cache 避免重复计算历史 Key/Value。

**口语化回答：**  
训练时整段文本都在，模型可以一次算很多位置；真正生成时，下一个词要等前一个词出来，所以是一点点往后生成。KV Cache 就是把以前算过的 K/V 存起来，别重复算。

**详细解释：**  
训练 GPT 时，使用 causal mask 保证每个位置只能看过去，但所有位置的 loss 可以同时算。推理时下一个 token 依赖前面已经生成的 token，所以必须逐步生成。KV Cache 保存过去层的 K/V，提升解码效率。

**面试官考察点：**  
是否理解训练并行和生成串行的区别。

**常见误区：**  
认为 Transformer 训练并行，所以生成也完全并行。

**可追问方向：**  
KV Cache 会增加还是减少显存占用？

**可追问参考答案：**  
- 标准版：KV Cache 通常会增加显存占用，因为需要保存每层历史 token 的 Key/Value；但它减少重复计算，显著提升自回归推理速度。  
- 口语版：它是用空间换时间。多占点显存，把以前算过的东西存住，后面生成就快很多。

## Transformer 18. 为什么 Decoder-only Transformer 适合做自回归文本生成？

**标准回答：**  
因为 Decoder-only Transformer 使用 causal masked self-attention，训练目标就是根据已有上下文预测下一个 token，这和文本生成过程天然一致。

**口语化回答：**  
Decoder-only 就是很适合“接着往下写”。它训练时学的就是看前文猜下一个词，推理时也是这么一个词一个词生成。

**详细解释：**  
GPT 的训练过程是：

```text
给定 token_1 ... token_t，预测 token_{t+1}
```

推理时重复这个过程，就能生成长文本。由于模型只依赖过去上下文，它可以自然用于对话、续写、代码生成和指令跟随。

**面试官考察点：**  
是否能把架构、mask、训练目标和生成方式串起来。

**常见误区：**  
只说 GPT “用了 Transformer”，没有说明 decoder-only 和自回归目标的匹配。

**可追问方向：**  
为什么 encoder-only 模型不天然适合逐 token 生成？

**可追问参考答案：**  
- 标准版：Encoder-only 模型通常使用双向上下文和理解式训练目标，没有 causal generation 约束，也没有天然的逐步生成训练目标。  
- 口语版：Encoder-only 更像读完整句话做理解，不是边写边预测下一个词，所以直接拿来生成不自然。

## Transformer 19. Transformer 有哪些常见变体和优化方向？

**标准回答：**  
常见方向包括位置编码改进、长上下文 attention 优化、FlashAttention、稀疏注意力、线性注意力、Encoder-only / Decoder-only / Encoder-Decoder 架构变体、MoE、参数高效微调等。

**口语化回答：**  
Transformer 后面的优化很多，有的是让它看更长，有的是让它算得更快，有的是让位置处理更好，有的是让参数更多但每次计算别太贵，比如 MoE。

**详细解释：**  
优化目标可能不同：FlashAttention 主要优化显存访问和计算效率；稀疏或线性注意力尝试降低长序列复杂度；RoPE / ALiBi 改善位置建模和外推；MoE 扩大参数量但控制每次激活计算量。

**面试官考察点：**  
是否了解 Transformer 在工程和研究中的真实演进。

**常见误区：**  
把所有优化都说成“降低参数量”。很多优化针对的是显存、速度、上下文长度或训练稳定性。

**可追问方向：**  
FlashAttention 改变了 attention 的数学结果吗？

**可追问参考答案：**  
- 标准版：FlashAttention 通常不改变标准 attention 的数学结果，而是通过分块计算和优化显存读写来提高速度、降低显存占用。  
- 口语版：它不是换了一个新的 attention 公式，更多是把同样的计算用更聪明的方式算，少搬数据、更省显存。

## Transformer 20. 如果面试官让你完整讲一遍 Transformer 中一次前向传播，你会怎么讲？

**标准回答：**  
输入文本先被 tokenizer 转成 token ids，查 embedding 并加入位置编码。然后进入多层 Transformer blocks：每层先通过 multi-head self-attention 让 token 之间交换信息，再通过 MLP 加工每个位置的表示，并使用残差连接和 LayerNorm 稳定训练。最后取目标位置的 hidden state，通过输出投影得到词表 logits，再 Softmax 得到概率。

**口语化回答：**  
我会这样讲：先把文字切成 token，再把 token 变成向量，加上位置信息。然后过很多层 Transformer，每层里先用 Attention 让词之间互相看，再用 MLP 加工每个词自己的表示。最后拿最后一个位置的向量去词表里打分，得到下一个 token 的概率。

**详细解释：**  
以 GPT 为例：

```text
文本
➡️ token ids
➡️ token embedding
➡️ position information
➡️ masked multi-head self-attention
➡️ residual + LayerNorm
➡️ MLP / FFN
➡️ residual + LayerNorm
➡️ 重复多层
➡️ final hidden state
➡️ linear / unembedding
➡️ logits
➡️ softmax
➡️ 下一个 token 概率
```

如果是 Encoder-Decoder 模型，还要补充 Encoder 先处理源序列，Decoder 在生成目标序列时通过 Cross-Attention 读取 Encoder 输出。

**面试官考察点：**  
是否能把所有模块按数据流串起来，并能区分 GPT、BERT、Encoder-Decoder 的差异。

**常见误区：**  
回答碎片化，只背组件名称，没有说明数据如何流动。

**可追问方向：**  
如果加入 KV Cache，推理时这个流程会发生什么变化？

**可追问参考答案：**  
- 标准版：加入 KV Cache 后，生成新 token 时不需要为所有历史 token 重新计算每层 Key/Value，只需计算当前 token 的 Q/K/V，并复用缓存的历史 K/V 进行 attention，从而提升推理效率。  
- 口语版：以前每生成一个词都要把前文重新算一遍；有了 KV Cache，前文算过的东西直接拿来用，只算新来的这个词，速度就快很多。

---

## 五、复习建议

1. 先背熟 Attention 的一句话：`Q 找 K，权重乘 V`。
2. 再背熟 Transformer 的一句话：`Embedding + Position ➡️ Attention 交流信息 ➡️ MLP 加工特征 ➡️ 多层堆叠 ➡️ logits ➡️ Softmax`。
3. 面试中不要只背公式，要能同时讲出直觉、公式、维度、复杂度和工程影响。
4. 对初中级岗位，重点准备 Q/K/V、mask、multi-head、position、encoder/decoder、GPT/BERT。
5. 对高级岗位，继续补充 KV Cache、FlashAttention、RoPE、长上下文、训练稳定性、推理优化。

## 六、参考来源

- [3Blue1Brown - Attention in transformers, step-by-step](https://www.3blue1brown.com/lessons/attention/)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [SharpSkill - Transformers & Attention Interview Questions](https://sharpskill.dev/en/technologies/data-science/interview-questions/transformers-attention)
- [Interview Query - Transformer Self-Attention](https://www.interviewquery.com/questions/transformer-self-attention)
- [InterviewBit - LLM Interview Questions and Answers](https://www.interviewbit.com/llm-interview-questions-answers/)
- [GeeksforGeeks - Deep Learning Interview Questions](https://www.geeksforgeeks.org/deep-learning/deep-learning-interview-questions/)
- [MLInterview.org - Explain the Transformer Architecture](https://www.mlinterview.org/questions/explain-transformer-architecture)

