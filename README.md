# 投递手记

个人求职工作台：按公司和岗位记录投递、简历版本、进展、面试、下一步动作及遗留事项。

投递渠道预置 LinkedIn、Boss直聘、猎聘、脉脉；兼容历史 BOSS 渠道及其他已保存渠道。

## 技术栈

React、TypeScript、Vinext / Vite、Cloudflare Workers 与 D1。线上由 Sites 托管并提供访问控制，GitHub 用于源码版本管理。

## 本地开发

需要 Node.js 22.13 或更高版本。

```sh
npm ci
npm run dev
```

数据库表结构在 `db/schema.ts`，迁移在 `drizzle/`。首次使用本地 D1 时需应用迁移；本地数据库与线上数据库独立。生产构建使用 `npm run build`。

## 部署与数据

`.openai/hosting.json` 绑定现有 Sites 项目及逻辑数据库 DB。Sites 部署需通过 Sites 发布流程；推送到 GitHub 本身不会部署网站。复用为新站点时应重新注册自己的 Sites 项目。

求职记录、简历信息存储于线上 D1，未作为数据导出包含在本仓库。环境变量、本地数据库、依赖与构建产物均不纳入版本管理。若迁移到其他托管平台，需单独配置数据库和访问控制。
