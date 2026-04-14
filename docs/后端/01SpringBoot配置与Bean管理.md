# Spring Boot 配置与 Bean 管理：配置、校验、JWT、Redis 串起来

很多人学 Spring Boot 时，最开始的体验都差不多：

- `application.yml` 会写一点
- 注解会用一点
- 项目能跑起来

但一旦项目进入真实开发，问题就会马上变得具体起来：

- 配置到底应该写成 `properties` 还是 `yml`
- 为什么这个 Bean 能注入，那个却扫不到
- 参数校验应该写在哪里
- JWT、拦截器、ThreadLocal、Redis 应该怎么串成一个闭环

这篇文章不想只讲一个局部点，而是按照你在 Spring Boot 项目里真实会遇到的顺序，把这些能力串起来。

## 一、配置文件先写稳：它不是附件，而是项目运行参数表

Spring Boot 项目真正启动之前，最先参与工作的通常不是业务代码，而是配置。

最常见的两种写法：

- `application.properties`
- `application.yml`

如果配置很少，`properties` 也能用。  
但一旦出现数据库、Redis、端口、多环境这些层级化参数，`yml` 会明显更清楚：

```yaml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/canbe_blog?serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=utf-8&allowPublicKeyRetrieval=true&useSSL=false
    username: root
    password: Root@123
  data:
    redis:
      host: localhost
      port: 6379
```

可以把它理解为：

- Java 代码负责定义系统能做什么
- 配置文件负责决定系统现在怎么运行

## 二、配置值怎么拿：`@Value` 和 `@ConfigurationProperties` 各有职责

### 1. `@Value` 适合少量单项读取

```java
@Component
public class ArticleConfig {

    @Value("${server.port}")
    private Integer port;

    @Value("${spring.datasource.username}")
    private String username;
}
```

### 2. `@ConfigurationProperties` 更适合配置建模

```java
@Component
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties {
    private String driverClassName;
    private String url;
    private String username;
    private String password;

    public String getDriverClassName() { return driverClassName; }
    public void setDriverClassName(String driverClassName) { this.driverClassName = driverClassName; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
```

如果只记一句话：

> `@Value` 更像临时取值，`@ConfigurationProperties` 更像长期建模。

## 三、Bean 管理别只停留在“能注入”，要知道它是怎么进容器的

### 1. 组件扫描

`@SpringBootApplication` 默认扫描启动类所在包及其子包。  
这也是很多“我明明写了 `@Component` 却注入失败”的根因。

```java
@ComponentScan(basePackages = "com.example")
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```

### 2. `@Bean` 显式注册

```java
@Configuration
public class CommonConfig {

    @Bean
    public Country country() {
        return new Country();
    }

    @Bean
    public Province province(Country country) {
        System.out.println("province: " + country);
        return new Province();
    }
}
```

### 3. 条件装配

```java
@Configuration
public class CommonConfig {

    @Bean
    @ConditionalOnProperty(prefix = "country", name = {"name", "system"})
    public Country country(
            @Value("${country.name}") String name,
            @Value("${country.system}") String system) {
        Country country = new Country();
        country.setName(name);
        country.setSystem(system);
        return country;
    }

    @Bean
    @ConditionalOnClass(name = "org.springframework.web.servlet.DispatcherServlet")
    public Province province() {
        return new Province();
    }
}
```

### 4. `@Import`

```java
@Import(CommonConfig.class)
@SpringBootApplication
public class SpringbootRegisterApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringbootRegisterApplication.class, args);
    }
}
```

如果把组件扫描理解成“自动发现”，那 `@Import` 就是“手动点名”。

## 四、参数校验要前置，不要等业务层自己兜底

### 1. 参数直接校验

```java
@RestController
@Validated
public class UserController {

    @PostMapping("/register")
    public Result register(
            @Pattern(regexp = "^\\S{5,16}$") String username,
            @Pattern(regexp = "^\\S{5,16}$") String password) {
        return Result.success();
    }
}
```

### 2. 对象校验

```java
@PutMapping("/update")
public Result update(@RequestBody @Validated User user) {
    return Result.success();
}
```

### 3. 分组校验

```java
public class Category {

    @NotNull(groups = Update.class)
    private Integer id;

    @NotEmpty
    private String categoryName;

    public interface Update {}
}
```

```java
@PutMapping
public Result update(@RequestBody @Validated(Category.Update.class) Category category) {
    categoryService.update(category);
    return Result.success();
}
```

## 五、JWT、拦截器和 ThreadLocal，才是登录态闭环的主干

### 1. JWT 配置

```java
@Configuration
public class JwtConfig {

    public static final String KEY =
            "canbespringframeworkspringframeworkspringframeworkspringframeworkspringframeworkspringframework";

    public static final long EXPIRE = 1000 * 60 * 60 * 24 * 2;

    public static final String TOKEN_HEADER = "Authorization";

    public static final String TOKEN_PREFIX = "Bearer ";
}
```

### 2. JWT 工具类

```java
public class JwtUtil {

    public static String generateToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);

        return JwtConfig.TOKEN_PREFIX + Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JwtConfig.EXPIRE))
                .signWith(SignatureAlgorithm.HS256, JwtConfig.KEY)
                .compact();
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(JwtConfig.KEY).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static Claims parseToken(String token) {
        return Jwts.parser().setSigningKey(JwtConfig.KEY).parseClaimsJws(token).getBody();
    }
}
```

### 3. 拦截器 + ThreadLocal

```java
@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        try {
            Map<String, Object> claims = JwtUtil.parseToken(token);
            ThreadLocalUtil.set(claims);
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        ThreadLocalUtil.remove();
    }
}
```

这一步的关键不是“能拦住未登录请求”，而是把用户信息在当前请求线程里传递起来，并在请求结束后及时清理。

## 六、想做主动失效，就别只靠 JWT 本身，要把 token 存进 Redis

### 1. 登录成功后写 Redis

```java
@PostMapping("/login")
public Result<String> login(
        @Pattern(regexp = "^\\S{5,16}$") String username,
        @Pattern(regexp = "^\\S{5,16}$") String password) {

    Map<String, Object> claims = new HashMap<>();
    claims.put("id", 1);
    claims.put("username", username);

    String token = JwtUtil.genToken(claims);
    stringRedisTemplate.opsForValue().set(token, token, JwtUtil.EXPIRE_TIME, TimeUnit.MILLISECONDS);
    return Result.success(token);
}
```

### 2. 拦截器中同时校验 Redis

```java
@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("Authorization");
        try {
            String tokenFromRedis = stringRedisTemplate.opsForValue().get(token);
            if (!StringUtils.hasLength(tokenFromRedis)) {
                throw new RuntimeException("token not exist");
            }

            Map<String, Object> claims = JwtUtil.parseToken(token);
            ThreadLocalUtil.set(claims);
            return true;
        } catch (Exception e) {
            response.setStatus(401);
            return false;
        }
    }
}
```

### 3. 修改密码后删除旧 token

```java
@PatchMapping("/updatePwd")
public Result updatePwd(@RequestBody Map<String, String> params,
                        @RequestHeader("Authorization") String token) {
    userService.updatePwd(params.get("new_pwd"));
    stringRedisTemplate.opsForValue().getOperations().delete(token);
    return Result.success();
}
```

## 七、Redis 接入本身并不复杂，但它是缓存和登录态控制的地基

### 1. 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 2. 配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

### 3. 最小测试

```java
@SpringBootTest
public class RedisTest {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Test
    public void testRedis() {
        ValueOperations<String, String> operations = stringRedisTemplate.opsForValue();
        operations.set("name", "canbe", 15, TimeUnit.SECONDS);
    }
}
```

## 八、分页、Profiles 和外部配置，是项目从能跑到可运维的分界线

### 1. PageHelper 分页

```xml
<dependency>
  <groupId>com.github.pagehelper</groupId>
  <artifactId>pagehelper-spring-boot-starter</artifactId>
  <version>1.4.6</version>
</dependency>
```

```java
public PageBean<Article> list(Integer pageNum, Integer pageSize, String categoryId, String state) {
    PageBean<Article> pageBean = new PageBean<>();

    PageHelper.startPage(pageNum, pageSize);

    Map<String, Object> claims = ThreadLocalUtil.get();
    Integer userId = (Integer) claims.get("id");
    List<Article> articles = articleMapper.list(userId, categoryId, state);

    Page<Article> page = (Page<Article>) articles;
    pageBean.setItems(page.getResult());
    pageBean.setTotal(page.getTotal());
    return pageBean;
}
```

### 2. Profiles 多环境

```yaml
spring:
  profiles:
    active: dev
server:
  servlet:
    context-path: /aaa
---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081
  servlet:
    context-path: /bbb
---
spring:
  config:
    activate:
      on-profile: test
server:
  port: 8082
---
spring:
  config:
    activate:
      on-profile: pro
server:
  port: 8083
```

## 九、一个容易被忽略但很实用的小点：本地 jar 安装到 Maven 仓库

```bash
mvn install:install-file -Dfile=C:\Users\Administrator\Desktop\资料\02_Bean注册资料\common-pojo-1.0-SNAPSHOT.jar -DgroupId=cn.itcast -DartifactId=common-pojo -Dversion=1.0 -Dpackaging=jar
```

## 最后

Spring Boot 项目真正稳定下来，靠的不是某一个注解，而是下面这条链：

1. 配置文件决定运行参数
2. Bean 管理决定对象怎么进入容器
3. 参数校验把错误挡在入口
4. JWT + 拦截器 + ThreadLocal 解决登录态
5. Redis 负责缓存与 token 主动失效
6. PageHelper、Profiles 和外部配置把项目推向可维护

真正让 Spring Boot 项目变稳的，是这些环节被串成一个系统。
