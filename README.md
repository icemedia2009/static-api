# 华为商城小程序后台（Cloudflare Workers 版）

把你的服务器 `https://api02.icemedia2009.workers.dev` 变成华为商城小程序的完整后台。

## 目录结构

```
worker/
├── worker.js          ← Worker 主程序（6个API路由）
├── data.js            ← 商城数据（改内容改这里）
├── wrangler.toml      ← Cloudflare 部署配置
├── package.json       ← 项目依赖
├── assets/
│   └── images/        ← 静态图片（banner/商品/分类图标）
└── README.md
```

## 一、部署步骤

### 方式 A：命令行部署（推荐）

1. 安装 Node.js（≥18）
2. 在 `worker` 目录打开终端，安装依赖：
   ```
   npm install
   ```
3. 登录 Cloudflare（首次会打开浏览器授权）：
   ```
   npx wrangler login
   ```
4. 部署：
   ```
   npx wrangler deploy
   ```
   部署成功后，终端会显示你的 Worker 域名（本项目 name 为 `api02`，域名即 `https://api02.<你的账号子域>.workers.dev`）。

### 方式 A2：GitHub 自动部署（Cloudflare Workers Builds）

1. 把本目录所有文件（含 `assets/`、`wrangler.toml`、`worker.js`、`data.js`、`package.json`、`.gitignore`）推送到 GitHub 仓库（**不要**提交 node_modules，`.gitignore` 已自动忽略）
2. Cloudflare Dashboard → Workers & Pages → 创建 → Workers → 连接 Git 仓库
3. 构建命令填 `npx wrangler deploy`（或依赖 package.json 的 deploy 脚本自动检测）
4. 每次 push 自动部署；部署后访问 `https://api02.<账号子域>.workers.dev`

### 方式 B：网页控制台部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → 创建 Worker
2. 把 `worker.js` 和 `data.js` 的**内容合并**（data.js 内容放最上面，worker.js 放下面，去掉 import 语句）
3. 图片需用 `wrangler` 或绑定 R2/KV 存储（网页控制台不便传静态资源）

> ⚠️ 注意：`workers.dev` 域名默认带你的用户名子域（如 `hwshop-api.xxx.workers.dev`）。如果要使用 `api02.icemedia2009.workers.dev` 这样的自定义域名，需要在 Dashboard 中配置**自定义域名**（Custom Domains）绑定到该 Worker。

## 二、部署后验证

浏览器打开以下地址测试（把域名换成你的）：

```
https://你的域名/api/banner/getBannerList?type=0        → 轮播图JSON
https://你的域名/api/goods/getHomeGoodsList              → 商品JSON
https://你的域名/api/category/getCategoryList            → 分类JSON
https://你的域名/api/user/getVerifyCode?mobile=13800000000 → 验证码
https://你的域名/api/user/register?loginName=abc&loginPassword=123   → 注册
https://你的域名/api/user/swxLogin?loginName=test&loginPassword=123456 → 登录
https://你的域名/images/goods/1555850845474.jpg          → 商品图片
```

## 三、切换小程序到你的后台

1. 修改 `miniprogram/app.ts`：
   ```ts
   globalData: {
     host: "https://你的域名",   // ← 改成你的
     userId: ""
   }
   ```
2. 开发调试：开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」
3. 正式发布：小程序后台配置 request 合法域名 + downloadFile 合法域名（图片域名）

## 四、预置账号

```
用户名: test    密码: 123456    （已预置，可直接登录）
```
也可以先注册新账号再登录。

## 五、修改内容

想改商品/轮播图/分类 → 编辑 `data.js` → 重新 `npx wrangler deploy` 即可。
想换图片 → 替换 `assets/images/` 下同名文件，或改 `data.js` 里的图片路径。

## 常见问题

- **构建报 `Unknown character "47"`**：wrangler.toml 里用了 `//` 注释（TOML 只认 `#`），已全部修正
- **接口返回 Not Found**：检查 URL 路径是否正确（/api/ 开头）
- **图片 404**：检查图片是否在 `assets/images/` 对应子目录
- **微信小程序真机不显示**：域名校验问题，需在小程序后台配置合法域名
- **想改域名**：所有图片 URL 都写死在 data.js 里（`https://api02.icemedia2009.workers.dev`），换域名时用编辑器全局替换
