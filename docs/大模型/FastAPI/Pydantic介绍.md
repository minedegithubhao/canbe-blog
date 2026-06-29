# Pydantic介绍

## Pydantic基本用法

### Pydantic是什么

**Pydantic** 是一个用于数据验证和设置管理的 Python 库

### Pydantic能解决什么问题

#### 让大模型输出结构化数据

大模型通过**`description`**来对输出进行格式化，所以写的越详细越好

```python
from pydantic import BaseModel, Field

class EducationItem(BaseModel):
    """单条教育经历"""
    school:   str = Field(description="学校名称")
    major:    str = Field(description="专业名称")
    degree:   str = Field(description="学历：本科/专科/硕士等")
    duration: str = Field(description="在校时间，如 2020.09 - 2024.06")
    gpa:      str = Field(default="", description="GPA 或成绩（可选）")

```

#### 读取配置与接口参数



### Pydantic自动类型转化

#### 基本类型转化

```python
from pydantic import BaseModel


class Student(BaseModel):
    name: str  # 字符串
    age: int  # 整数


# 用关键字参数创建实例
s = Student(name="小明", age=18)
s2 = Student(name="小红", age="18")
s3 = Student(name="小刚", age="十八")
print(s)  # name='小明' age=18
print(s2)  # name='小明' age=18
print(s3)  # ValidationError
```

#### 字典 → pydantic对象

通过解包的方式，将字段快速转为pydantic对象

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    phone: str = Field(default="", description="手机号")  # 可选：有默认值 ""
    age: int = Field(default=18, description="年龄")  # 可选：默认 18


info = {"name": "小明", "phone": "12345678901", "age": 18}
user = UserProfile(**info)
print(type(info))  # <class 'dict'>
print(user)  # name='小明' phone='12345678901' age=18
```

#### 复杂对象 → pydantic对象

嵌套部分可以直接用字典，Pydantic 会自动转成对应的子模型

```python
from pydantic import BaseModel, Field

class EducationItem(BaseModel):
    school: str = Field(description="学校名称")
    major:  str = Field(description="专业名称")

class Resume(BaseModel):
    name:      str                = Field(description="姓名")
    education: list[EducationItem] = Field(default_factory=list)  # 教育经历列表

# 创建时，嵌套部分可以直接用字典，Pydantic 会自动转成对应的子模型
resume = Resume(
    name="小明",
    education=[
        {"school": "清华大学", "major": "计算机"},
        {"school": "北京大学", "major": "软件工程"},
    ],
)

print(resume.name)                    # 小明
print(resume.education[0].school)     # 清华大学  ← 注意：已经是 EducationItem 对象了
print(type(resume.education[0]))      # <class '__main__.EducationItem'>
```

#### pydantic对象 → 字典

```python
class Student(BaseModel):
    name: str = Field(description="姓名")
    age: int = Field(default=18, description="年龄")


s = Student(name="小明", age=20)

d = s.model_dump()  # 模型 → 字典
print(d)  # {'name': '小明', 'age': 20}
print(type(d))  # <class 'dict'>

```

#### json → pydantic对象

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    phone: str = Field(default="", description="手机号")  # 可选：有默认值 ""
    age: int = Field(default=18, description="年龄")  # 可选：默认 18


info = {"name": "小明", "phone": "12345678901", "age": 18}
import json

info_json = json.dumps(info)
print(type(info_json), info_json)  # <class 'str'> {"name": "\u5c0f\u660e", "phone": "12345678901", "age": 18}
user = UserProfile.model_validate_json(info_json)
print(user)  # name='小明' phone='12345678901' age=18
```

#### pydantic对象 → json

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    phone: str = Field(default="", description="手机号")  # 可选：有默认值 ""
    age: int = Field(default=18, description="年龄")  # 可选：默认 18


user = UserProfile(name="小明")
print(user.model_dump_json())  # {"name":"小明","phone":"","age":18}
```

### Pydantic自动类型校验

#### 默认值

pydantic中定义的所有属性都必须有值

```python
class Student(BaseModel):
    name: str  # 字符串
    age: int  # 整数
    address: str

s = Student(name="小明", age=18)  # ValidationError, 
```

可以使用`default`设置默认值

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    age: int = Field(default=18, description="年龄")  # 可选：默认 18


u = UserProfile(name="张三")
print(u)  # name='张三' phone='' age=18 address=None
```

设置`None`值

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    address: Optional[str] = Field(default=None, description="地址")  # 默认为None


u = UserProfile(name="张三")
print(u)  # name='张三' address=None~
```

`default_factory`为值指定工厂方法，初始化时回默认调用工厂方法，使用`list`作为列表的工厂方法

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    tags:  list[str] = Field(default_factory=list, description="标签列表")  # 默认为空列表


u = UserProfile(name="张三")
print(u)  # name='张三' tags=[]
```

#### 不可变参数

使用`frozen=True`让字段不可变

```python
class UserProfile(BaseModel):
    age: int = Field(default=18, frozen=True, description="年龄")  # 不可变字段

u = UserProfile(age=19)
print(u)  # age=19
u.age = 20  # ValidationError
print(u)
```

#### 校验

`lt`限制最大值

```python
class UserProfile(BaseModel):
    age: int = Field(lt=100, description="年龄")  # lt限制最大值

u = UserProfile(age=190)
print(u)  # ValidationError
```

复杂校验

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    phones: list[str] = Field(default_factory=list, description="手机号列表")  # 可选：有默认值 ""

    @field_validator("phones")
    @classmethod
    def validate_phones(cls, v: list[str]) -> list[str]:
        for n in v:
            if len(n) != 11 or n[0] != '1':
                raise ValueError(f"Invalid phone number: {n}")
        return v


# u = UserProfile(name="张三", phones=["138"])  # ValidationError
u2 = UserProfile(name="李四", phones=["13800000001", "13800000002"])  # name='李四' phones=['13800000001', '13800000002']

```

常用完整版

```python
class UserProfile(BaseModel):
    name: str = Field(description="用户姓名")  # 必填：没有默认值
    phone: str = Field(default="", description="手机号")  # 可选：有默认值 ""
    age: int = Field(default=18, description="年龄")  # 可选：默认 18
    address: Optional[str] = Field(default=None, description="地址")  # 默认为None
    tags:  list[str] = Field(default_factory=list, description="标签列表")  # 默认为空列表


u = UserProfile(name="张三")
print(u)  # name='张三' phone='' age=18 address=None
```

### 枚举

```python
from enum import Enum

class InterviewStage(str, Enum):       # 继承 str，取值就是字符串
    WARMUP    = "warmup"
    TECH_BASE = "tech_base"
    PROJECT   = "project"
    CLOSING   = "closing"
    FINISHED  = "finished"

print(InterviewStage.WARMUP)           # InterviewStage.WARMUP
print(InterviewStage.WARMUP.value)     # warmup
```

### BaseSettings

从环境变量 / .env 文件读配置

```python
class Settings(BaseSettings):
    """从环境变量 / .env 文件读配置"""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")  # 自动忽略Settings模型没有声明的多余字段

    app_name: str = "KnowForgeRAGPlatform"

    # MySQL 保存聊天历史、摘要、反馈、知识库版本控制面和入库 manifest，启动前必须可连接。
    mysql_host: str = Field(default="localhost", validation_alias="MYSQL_HOST")
    mysql_port: int = Field(default=3306, validation_alias="MYSQL_PORT")
    mysql_user: str = Field(default="root", validation_alias="MYSQL_USER")
    mysql_password: str = Field(default="", validation_alias="MYSQL_PASSWORD")
    mysql_database: str = Field(default="subjects_kg", validation_alias="MYSQL_DATABASE")
```



