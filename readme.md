# koa-backend

将`joi`, `swagger`, `koa` 通过 `decorator` 的方式连接起来, 这是此项目的开发初衷.

[x] koa生态系统
[x] jwt登录验证
[x] 自动生成`swagger`接口文档
[x] `nodemon` 自动重启
[x] 使用 `decorator` 的方式完成接口参数验证
[x] `controller` 错误自动捕捉
[x] `typescript` 支持
[x] 基于 `typeorm` 的数据库 `orm` 支持
[x] `mysql` 事务支持(隔离支持)
[ ] 根据typeorm实体自动生成swagger的definition

## 目录说明
```
.
├── ./ormconfig.js  // typeorm配置文件
├── ./package.json 
├── ./package-lock.json
├── ./readme.md // readme
├── ./src // 源码目录
│   ├── ./upload // 文件上传目录
│   ├── ./src/controllers // 控制器相关
│   │   ├── ./src/controllers/example.ts 
│   ├── ./src/decorators // decorators相关
│   │   ├── ./src/decorators/controller.ts
│   │   ├── ./src/decorators/definition.ts
│   │   ├── ./src/decorators/description.ts
│   │   ├── ./src/decorators/index.ts
│   │   ├── ./src/decorators/interface.ts
│   │   ├── ./src/decorators/ischema.ts
│   │   ├── ./src/decorators/login_required.ts
│   │   ├── ./src/decorators/method.ts
│   │   ├── ./src/decorators/parameter.ts
│   │   ├── ./src/decorators/response.ts
│   │   ├── ./src/decorators/summary.ts
│   │   ├── ./src/decorators/tag.ts
│   │   └── ./src/decorators/utils.ts
│   ├── ./src/definitions // 主要用于swagger中模型
│   │   ├── ./src/definitions/BaseSchema.ts
│   │   └── ./src/definitions/User.ts
│   ├── ./src/entity // 数据库表(typeorm实体)
│   │   ├── ./src/entity/BaseEntity.ts
│   │   └── ./src/entity/User.ts
│   ├── ./src/main.ts // 应用入口
│   └── ./src/utils // 工具目录
│       ├── ./src/utils/config.ts // 应用配置
│       ├── ./src/utils/JoiToSwagger.ts 
│       └── ./src/utils/middlewares.ts // koa middleware相关
├── ./tsconfig.json // ts配置
├── ./tslint.json
├── ./typings.json
└── ./yarn.lock
```

## 开始使用

### 定义 `controller`

应用中所有请求均为一个 `js class`, 加上 `@controller` 即可

```js
import {
  controller,
} from "../decorators";

@controller('/example')
export default class ExampleController {
   /* whatever you like */
}
```

上述例子即可实现一个基础 `controller` 的定义, `@controller` 中参数即为此控制器对应的响应路径前缀.

当然要完成一个简单请求, 这是不够的, 因为还没有定义与之相关的处理方法

### 定义处理函数

应用包装了 `@get`, `@post`, `@put`, `@delete`, `@update` 等常用http方法, 我们只需要为上一步中 `controller` 的 `method` 上面加上对应方法的装饰器即可.

```js
import {
  get,
  controller,
} from "../decorators";

@controller('/example')
export default class ExampleController {
  @get('/hello')
  async Hello() {
    return 'hello world'
  }
}
```

现在, 切换到项目根目录, 执行 `npm start`, 打开浏览器在地址栏输入 `http://localhost:3002/example/hello` 即可.

### 处理响应

通过包装 `koa` 的响应方法, 现在我们只需要在 `controller` 的方法下面直接 `return` 需要响应的值即可, 装饰器会接收响应参数并返回到浏览器.

**需要注意: 这意味着我们必须显示return一个值给装饰器**

如以下行为是不被建议的:
```js
import {
  get,
  controller,
} from "../decorators";

export default class ExampleController {
  @get('/hello')
  async Hello() {
     // bad 没有显示的return
  }

  @get('/hello')
  async Hello() {
     // bad 没有return任何有价值的东西
     return ;
  }

  @get('/hello')
  async Hello() {
     // bad 同上, 没有return任何有价值的东西
     return undefined;
  }
  
  @get('/hello')
  async Hello(ctx) {
     // bad 请不要直接使用ctx.body = anything; 这会被覆盖
     ctx.body = 'hello';
     return 'world';
  }

  @get('/hello')
  async Hello(ctx) {
     // bad 这样实际是可以运行的, 但是仍然不推荐使用
     ctx.body = 'hello';
  }

  @get('/hello')
  async Hello() {
     // good! nice!
     return = 'hello';
  }
}
```

### 处理请求

在 `api` 系统中, 参数不可避免, 而且在处理方法内部对参数进行校验这实际会写上很多的样板代码, 也影响业务逻辑.
因此, 我们采用 `joi` 进行参数验证.

```js
import {
  get,
  parameter,
  controller,
} from "../decorators";
import * as joi from 'joi';
import { IContext } from "../decorators/interface";

@controller('/example')
export default class ExampleController {
  @get('/hello')
  @parameter('params', joi.object().keys({
    a: joi.number().required(),
    b: joi.string()
  }), ENUM_PARAM_IN.body)
  @parameter('userId', joi.number().integer().description('用户id').required(), ENUM_PARAM_IN.path)
  @parameter('param1', joi.string().description('其他参数').required(), ENUM_PARAM_IN.query)
  async Hello(ctx: IContext) {
       // IContext 为定义的一个ts类型, 扩展了 koa 的 ctx
       // 为ctx加上了 $getParams 方法, 方便获取验证成功后的请求参数
       return ctx.$getParams();
  }
}
```

如上: 通过 `@parameter` 装饰器我们可以很方便定义接口参数, 并借助 `joi` 的魔力对其进行验证
系统可以对 `querystring`, `path`, `body` 进行参数验证
`ENUM_PARAM_IN` 为系统定义的 `enum`, 包含 'path' | 'body' | 'query', 默认 query

### 处理错误

每个控制器均支持错误 `Error Catch` 的能力

我们可以直接在应用中使用 `throw` 抛出错误, 应用在方法外层会自动捕捉并返回给前端, 参考以下示例

```js
import {
  get,
  controller,
} from "../decorators";
import { IContext } from "../decorators/interface";

@controller('/example')
export default class ExampleController {
  @get('/hello')
  async Hello() {
     // 抛出一个默认的 500 错误, error message会默认发送给前端
     throw new Error('just an error');
  }
  @get('/hello')
  async Hello(ctx: IContext) {
     // 通过ctx.throw 我们可以抛出一个自定义状态码的错误
     ctx.throw(400, 'just an error');
  }
}
```

### 生成 `swagger`

应用提供了 `@description`, `@tag`, `@summary`, `@response` 等装饰器来处理`swagger`的情况

```js
import {
  post,
  tag,
  summary,
  response,
  controller,
} from "../decorators";
import * as omit from 'omit.js';
import * as joi from 'joi';
import * as jwt from "jsonwebtoken";
import { User } from '../entity/User';
import { AppConfig } from '../utils/config';
import UserSchema from "../definitions/User";
import { Like } from "typeorm";
import { IContext } from "../decorators/interface";

@controller('/example')
export default class ExampleController {
  @post('/login')
  @parameter(
    'body', 
    joi.object().keys({
      name: joi.string().required().description('用户名'),
      password: joi.string().required().description('密码'),
    }), ENUM_PARAM_IN.body
  )
  @description('用户登录例子')
  @tag('用户管理')
  @summary('用户登录')
  @response(200, {
    user: { $ref: UserSchema, desc: '用户信息' },
    token: joi.string().description('token, 需要每次在请求头或者cookie中带上'),
  })
  async login(ctx: IContext) {
    const { name, password }: User = ctx.$getParams();
    const user: User = await User.findOne({ name });
    if (!user || user.password !== password) {
      throw new Error('用户名密码不匹配');
    }
    const token = jwt.sign({
      data: user.id
    }, AppConfig.appKey, { expiresIn: 60 * 60 });
    ctx.cookies.set('token', token);
    return {
      token,
      user: omit(user, ['password'])
    };
  }
}
```

现在, 打开浏览器, 在地址栏输入 `http://localhost:3002/docs`, 即可查看生成的接口swagger文档

`user: { $ref: UserSchema, desc: '用户信息' },` 这里面的 `$ref`, 即转换后的 `swagger definition`, 在`./src/definitions`目录下即可定义

### 使用数据库

应用使用 `typeorm` 来作为数据库的 `orm` 工具.

1. 安装并登录 `mysql` 创建一个数据库

```shell
sudo apt install mysql-server mysql-client

mysql -u root -p

> create database test default charset=utf8;
```

2. 编辑 `ormconfig.js` 文件, 修改数据库相关配置

3. 在 `./src/entity` 目录下面定义 `typeorm` 实体, 并定义实体的相关属性, 详细配置可参考 [typeorm文档](http://typeorm.io/#/)

4. 在 `controller` 中导入上一步中定义的模型, 使用方式参考 `./src/controlls/user.ts`

```js

```

### 使用事务

我们在 `ctx` 中内置了 `typeorm` 的 [manager](http://typeorm.io/#/transactions), 在控制器开始前开启一个 `typeorm` 的事务, 检测到应用内抛出的异常之后, 则自动回滚事务,  若应用正常被处理, 则自动提交事务. 

**注意: 因为需要检测应用内异常, 所以只能通过throw 方式抛出的异常才能被正确处理, 而不能使用ctx.throw**

一个栗子: 

```js
  /**
   * 新增用户
   */
  @post('/add')
  @tag('用户管理')
  @parameter(
    'body', 
    joi.object().keys({
      name: joi.string().required().description('用户名'),
      password: joi.string().required().description('密码'),
    }), ENUM_PARAM_IN.body
  )
  @summary('添加管理员')
  @login_required()
  @response(200, { $ref: UserSchema })
  async addUser(ctx: IContext) {
    const userInfo: User = ctx.$getParams();
    const lastUser = await User.findOne({ name: userInfo.name });
    if (lastUser) {
      throw new Error('用户已存在');
    }
    const user = new User(userInfo);
    await ctx.manager.save(user);
    return omit(user, ['password']);
  }
```

### 登录验证

系统提供了 `login_required` 装饰器, 使用时加上即可, 栗子见上面

持续更新中, 更多功能请关注此仓库...