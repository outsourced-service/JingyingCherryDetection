# Project Setup

## 开发依赖

```sh

node v16.20.2
npm  v8.19.4

# 建议不要用 cnpm，有各种诡异的bug和各种兼容问题，可以通过如下
yarn install --frozen-lockfile

# 启动服务
npm run dev
```

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

## 项目结构

```
├── mock                        // 项目mock模拟数据
├── public                      // 静态资源
│   │── favicon.ico            // favicon图标
│   └── index.html              // html模板
├── src                         // 源代码
│   ├── api                    // 所有请求
│   ├── assets                 // 主题 字体等静态资源
│   ├── components             // 全局公用组件
│   ├── config                 // 全局配置
│   ├── icons                  // 项目所有 svg icons
│   ├── layout                 // 全局 layout
│   ├── router                 // 路由配置
│   ├── store                  // 全局 store管理
│   ├── styles                 // 全局样式
│   ├── utils                  // 全局工具
│   ├── views                   // views 所有页面
│   ├── App.vue                // 入口页面
│   └── main.js                // 入口 加载组件 初始化等
├── tests                       // 测试
├──.env.xxx                    // 环境变量配置
├──.eslintrc.js                // eslint 配置项
├──.babelrc                    // babel-loader 配置功能
```

## 功能

- [x] 用户管理
- [x] 创意圈子管理
- [x] 任务管理
- [x] 课题管理
- [x] 首页管理
- [x] 活动管理
- [x] 积分商城管理
- [x] 能力看板数据
