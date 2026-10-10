---
name: development-environment
description: 开发环境部署。用于已有PRD、既有前端原型、若依框架的首次项目建设；本技能负责单步骤交付和证据审查。
---

# 开发环境部署

## 1. 职责与范围

本技能负责完成「开发环境部署」，为下一个研发步骤提供可审核产物。输入资料位于 `docs/input/`，产物统一位于 `docs/output/`。后端在 `code/guiwu_ruoyi/` 现有框架上扩展，前端必须沿用 `code/fld/` 原型的布局、样式与组件。

## 2. 输入

- `docs/output/02-整体架构/整体架构设计.md`
- `docs/output/03-数据库总体/数据库总体设计.md`
- `docs/input/环境资料/`
- `D:/company/environment/（有则优先复用）`
- `code/fld/`
- `code/guiwu_ruoyi/`

## 3. 工作步骤

1. 先探测目标开发机已运行的MySQL、Redis等服务，检查D:/company/environment/和端口占用。
2. 依据架构和数据库总体方案仅补齐真正需要的数据库、中间件，不重复部署可复用依赖。
3. 配置code/guiwu_ruoyi与code/fld，实际验证数据库连接、后端启动和前端API代理。
4. 留存执行命令、健康证据、日志与阻塞问题，失败先诊断再修复。

## 4. 异常与审核

不将开发环境安装等同于生产上线，禁止记录真实密钥。

审核要求：开发人员实际核验数据库和必要中间件，验证已有前后端连接成功；未实测不得宣称完成。

不足以得出真实结论时提出关键问题和有依据的推荐。未经确认不得将推荐写成最终约束；未实际操作不得宣称已完成。涉及 Git 提交使用中文说明。

## 5. 输出

- `docs/output/04-开发环境/开发环境部署与验收.md`
- `按需：deploy/dev/docker-compose.yml`
- `按需：deploy/dev/.env.example`

## 6. 配套资源

- [使用示例](examples/使用示例.md)
- [输出模板](templates/输出模板.md)
