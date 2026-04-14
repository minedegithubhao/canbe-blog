# JWT 权限系统最小闭环：配置、拦截器、注解和全局异常

很多项目把“权限系统”理解成登录成功以后返回一个 token。  
但真正能保护接口的权限系统，至少要把下面几件事接起来：

- token 怎么生成
- token 怎么校验
- 请求进来以后谁负责拦截
- 接口角色要求写在哪里
- 认证失败和权限不足怎么区分

这里这一块已经很接近一个可运行 demo，这次直接按读者能照着搭的顺序展开。

## 一、先定配置：密钥、过期时间、请求头和前缀必须统一

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

这一层定义了整个系统的协议：

- 用哪个请求头传 token
- token 过期多久
- 有没有统一前缀

## 二、JWT 工具类最少要有三件事：生成、校验、解析

```java
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

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
            logger.error("token验证未通过");
            return false;
        }
    }

    public static Claims parseToken(String token) {
        return Jwts.parser().setSigningKey(JwtConfig.KEY).parseClaimsJws(token).getBody();
    }
}
```

## 三、认证和鉴权不要混成一件事

### 1. 认证

先回答：你是谁。

例如：

- 有没有带 token
- token 是否有效
- token 是否过期

### 2. 鉴权

再回答：你能做什么。

例如：

- 你是不是 admin
- 你有没有访问这个接口的角色

## 四、拦截器是系统真正开始做权限判断的地方

```java
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        String token = request.getHeader(JwtConfig.TOKEN_HEADER);

        if (StrUtil.isBlank(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("The request lacks a Token: " + request.getRequestURI());
            return false;
        }

        token = token.replace(JwtConfig.TOKEN_PREFIX, "");

        if (!JwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token is expired or invalid: " + request.getRequestURI());
            return false;
        }

        Claims claims = JwtUtil.parseToken(token);
        String role = claims.get("role", String.class);

        RoleRequire roleRequire = handlerMethod.getMethodAnnotation(RoleRequire.class);
        if (roleRequire != null) {
            boolean hasPermission = false;
            String[] allRoles = roleRequire.value();
            for (String allRole : allRoles) {
                if (allRole.equals(role)) {
                    hasPermission = true;
                    break;
                }
            }
            if (!hasPermission) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("The role lacks permission: " + request.getRequestURI());
                return false;
            }
        }

        request.setAttribute("userId", claims.get("userId", Long.class));
        request.setAttribute("username", claims.get("username", String.class));
        request.setAttribute("role", role);

        return true;
    }
}
```

这段代码把整套链路串起来了：

1. 跳过非控制器请求
2. 获取请求头 token
3. 校验 token 是否存在
4. 校验 token 是否合法
5. 解析用户信息
6. 检查接口角色要求
7. 把用户信息塞进当前请求上下文

## 五、自定义注解让权限要求从 if 判断里解耦出来

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RoleRequire {
    String[] value() default "";
}
```

控制器里这样写：

```java
@GetMapping("/admin")
@RoleRequire("admin")
public Map<String, Object> admin(HttpServletRequest request) {
    Map<String, Object> result = new HashMap<>();
    result.put("code", 200);
    result.put("message", "admin访问成功");
    result.put("data", Map.of(
            "username", request.getAttribute("username"),
            "role", request.getAttribute("role"),
            "userId", request.getAttribute("userId")));
    return result;
}
```

## 六、注册拦截器时，放行路径要明确

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public AuthInterceptor authInterceptor() {
        return new AuthInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/login");
    }
}
```

## 七、控制器最小示例：登录接口 + 普通接口 + 受保护接口

```java
@RestController
@RequestMapping("/api")
public class AuthController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestParam String username,
                                     @Validated @RequestParam String password) {
        Map<String, Object> result = new HashMap<>();
        long userId = "admin".equals(username) ? 1L : 2L;
        String role = "admin".equals(username) ? "admin" : "user";
        String token = JwtUtil.generateToken(userId, username, role);

        result.put("code", 200);
        result.put("message", "login访问成功");
        result.put("data", token);
        return result;
    }

    @GetMapping("/common")
    public Map<String, Object> common(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "common访问成功");
        result.put("data", Map.of(
                "username", request.getAttribute("username"),
                "role", request.getAttribute("role"),
                "userId", request.getAttribute("userId")));
        return result;
    }
}
```

## 八、为什么一定要区分 401 和 403

### 1. 401

表示未认证，例如：

- 没带 token
- token 无效
- token 已过期

### 2. 403

表示身份合法，但权限不足，例如：

- 已经登录
- 但角色不满足接口要求

## 九、全局异常捕获是权限系统的收尾层

```java
@RestControllerAdvice
public class GlobalException {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handlerException(Exception e) {
        String message = e.getMessage();

        if (StrUtil.isBlank(message)) {
            message = "服务器异常请联系管理员";
        } else {
            message = "系统发生异常" + message;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("code", 500);
        result.put("message", message);
        result.put("data", null);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }
}
```

## 最后

真正的 JWT 权限系统最小闭环是：

1. 配置统一协议
2. 工具类统一生成和解析 token
3. 拦截器统一做认证
4. 注解统一描述接口权限要求
5. 请求上下文统一传递用户信息
6. 全局异常统一兜底响应

只有把这几步串起来，token 才不是“登录后返回的一段字符串”，而是一个真正能保护接口的权限系统。

