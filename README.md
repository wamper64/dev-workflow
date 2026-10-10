# 项目研发导航（报价系统）
基于已有 `input/` 资料、`code/fld` 前端原型和 `code/guiwu_ruoyi` 若依框架，设计首次项目建设研发流程。

## 第一阶段：只审核报价系统
当前提供 9 个阶段、25 项研发活动、13 个待审核模块，以及 8 步模块迭代循环。模块与Spec数量都不是强制预设。标准项目模式将在报价流程获得确认后再建设。

## 在线地址
https://wamper64.github.io/dev-workflow/

需要在 GitHub → Settings → Pages 中选择 **GitHub Actions** 作为 Source。站点使用 `docs/` 目录并由 `.github/workflows/deploy.yml` 自动发布。

## 后期修改
研发流程和模块唯一数据源为 `docs/data/quotation.json`，HTML、CSS、JS 仅作为展示层。修改JSON并提交 `main` 后自动重建并发布；所有 Git 提交说明使用中文。

## 当前保留的约束
- `input/需求资料` 保存确认的PRD；`input/工程资料`、`环境资料`、`对接资料` 按已有资料提供。
- 前端只在现有原型上开发，已有样式、组件和风格必须沿用；不得重搭另一套。
- 后端在已有若依工程上扩展。
- 先识别审核模块，再选择本轮已确定模块，按Spec/Tickets/TDD/评审/集成迭代。
- 下一阶段再加入完整Skill正文、示例、模板及导出。
- 公开网站只展示方案与脱敏信息，不存放真实客户文档及密钥。
