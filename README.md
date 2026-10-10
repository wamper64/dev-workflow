# 标准项目研发导航

**在线地址**：https://wamper64.github.io/dev-workflow/

本仓库面向定制前后端及Agent+前后端项目的首次建设流程。报价系统仅用于独立的Skill输出示例，不限定项目名称、现有代码子目录或技术栈。

## 固定输入与边界

```text
项目根目录/
├── docs/
│   ├── input/
│   │   ├── 需求资料/       # 已确认PRD，包含原型页面映射
│   │   ├── 工程资料/       # 前期架构、方案、技术选型（可选）
│   │   ├── 环境资料/       # 服务器/开发环境（可选）
│   │   └── 对接资料/       # 第三方或设备接口（可选）
│   └── output/            # 各阶段正式产物
├── code/                # 既有项目工程；子目录名称由真实项目决定
└── skills/              # 可安装Skill目录，不含任何项目输出示例
```

严禁在原型之外重搭一套风格；业务开发可改页面数据及小范围细节，不重做已有原型视觉与通用组件。已确认的PRD不在本阶段重新制定。

## 网站

左栏为工作阶段，中栏为步骤，右栏为所用Skill、输入、输出、审核和可复制中文提示词。点击Skill可以选择按其特点设计的快速理解、报价项目示例、完整目录文件以及**逐文件开源研究来源与实际借鉴机制**。

左侧「工作阶段」下方独立展示「通用 Skills」入口（共7项，含handoff、grilling、research、domain-modeling、wizard、pr和to-questionnaire）；右侧可查看用途、执行方式与官方全部文件。右上角新增「项目目录树」：按当前四阶段、每个步骤的预期产物绘制完整树并加中文注释，支持复制；另可下载全部Skills ZIP。

## 当前流程

| 阶段 | 工作内容 |
|---|---|
| 0 准备工作 | 展示已确认docs/input/资料与既有code/，不调用Skill |
| 1 项目准备与设计 | 输入确认→Matt初始化→项目基线→整体架构（内部Grill）→数据库总体→开发环境→模块拆分 |
| 2 模块迭代开发 | 选择模块→模块详细设计（内置Grill）→Spec→Tickets→dev-implement-spec（调用Matt原版实现/TDD/代码审查后追加人工用例）→人工执行回填（无Skill）→按需Bug诊断修复→本轮收口（内部retro）→下一轮 |
| 3 全项目验收与部署 | 系统业务验收→非功能上线评审→生产预演与回滚→正式部署交接 |

共**4个阶段、21个导航步骤**，其中2项只展示已有输入、2项无独立Skill（输入核对提示词和人工测试）。Skill目录包含**21份主流程/内部调用Skill**（包括Matt原版implement-spec、retro和改造的dev-implement-spec）。另外有7个通用工具Skill及3个必要官方依赖，共**31份SKILL.md**。实际模块数量须从PRD识别；报价项目的案例单独放在 `docs/examples/报价项目/`。

## Skill质量与采用原则

- **Matt官方原版**：在不更改内容的前提下复用，不重写成“二次封装”。
- **基于Matt改造或自建**：先研究真实开源SKILL.md，按定制前后端、已有代码/原型保真、角色审核和真实证据规则改造，不预设特定框架。
- **项目基线**：已采用现有较成熟的工程基线Skill方案，包括技术栈、资源量化、数据保存年限、性能和并发指标；不默改其内容。
- **其他自建/改造**：已补齐专项执行流程、可判断检查关卡、产物模板和报价业务示例，目前为**可评审初版**，仍需真实项目演练和人工确认，不以模板齐全代表已成熟。
- 来源及“参考了什么机制”：见 [逐Skill调研记录](docs/research/skill-sources.md)。研究资料独立于可安装Skill正文。

## 自动发布与保护

GitHub Pages源设置为 **GitHub Actions**。每次提交`main`后，`.github/workflows/deploy.yml`构建带内联资源的网站及Skills ZIP，并测试基本的阶段、步骤、Skill目录、Grill、人工测试和通用工具交互。CI失败不发布。

开发约定：所有Git提交消息使用中文；本公开仓库不存真实客户PRD、生产密码或未脱敏接口数据。

## 2026-10-10：对抗式审计与来源学习
- 项目基线Skill与Matt原版正文未改；其余14个主流程定制Skill完善执行图/失败处理/证据机制。
- S04整体架构设计内部调用Grill，S09模块详细设计内部按需调用Grill，保持项目准备与设计7步不额外加独立节点；Matt to-spec只综合已确认内容。
- Matt code-review仅**Standards + Spec**；S12调用自建dev-implement-spec，其中完整调用Matt原版implement-spec执行TDD与Standards/Spec双轴代码审查；完成后生成待执行人工测试单，S14H只由人工执行和回填，S14B以官方六阶段诊断Bug。
- 整体架构需要全部四类docs/input、基线及既有代码；数据总体与模块详细设计也必须读取项目基线。
- 环境部署不要求固定的个人电脑目录。模块详细设计只输出SQL迁移设计草案，TDD编码阶段才产生正式版本化迁移。
- 详细来源见 `skills/REFERENCES.md` 和 `docs/research/skill-sources.md`：标明具体项目及Skill名称、学习机制和项目采用/改造，不进入可安装Skill正文。
- 静态契约校验：`python3 scripts/audit_contracts.py`；`python3 scripts/build_site.py` 在构建前强制运行校验并生成离线站点与Skills包。

- 首次进入S08时按已审核模块清单初始化 `docs/output/项目总控/项目实施状态.md`，后续轮次只更新，不覆盖历史已验收记录。
- 完整逐步输入输出核对见 `docs/输入输出契约与对抗性审查.md`。

- 现行流程S12通过dev-implement-spec将Matt原版TDD/集成验证与code-review分别归档为 `实现与自动验证记录.md`、`代码审查记录.md`，S14H复用证据，不重复一轮AI自动测试。
- 开发环境统一输出 `docs/output/04-开发环境/部署步骤与执行记录.md`；人工测试唯一主记录是 `docs/output/06-模块迭代/<模块>/人工测试用例与结果.md`，后续模块收口与系统验收共用该文件。

## 标准项目与案例分离

- `docs/input/`：真实项目需求/工程/环境/对接资料。
- `code/`：真实已有工程，不预设 `fld`、`guiwu_ruoyi` 等目录。
- `docs/examples/报价项目/`：仅供网页演示，非安装Skill组成部分。
- 读取/检查输入：S01 只有提示词和会话核对结论，没有专用Skill。
- S12 实现完成后自动生成待执行人工测试单，S14H 不调用Skill，由人工执行并在同一文件回填结果。

## 调研参考：pstack 与 Addy Osmani

借鉴了 pstack 的真实用户路径验证、视觉基线、模块设计草图与按需对抗式审查，以及 Addy Osmani 的纵向切片、真实浏览器运行验证和可执行质量阈值。**不增加重复Skill**，研究细节见 `docs/research/skill-sources.md`；正式Skill安装包不包含案例及研究报告。

## 2026-10-10：每轮retro、扩展实现Skill与通用工具筛选

- `skills/dev-implement-spec/SKILL.md`：先调用未修改的官方`implement-spec`，再新增需求基线角色×场景与真实自动化覆盖对比，生成`人工测试用例与结果.md`供下一步人工回填；不新增重复Review。
- `skills/iteration-close/SKILL.md`：本轮完成实际人工验收后**明确调用官方retro**，复盘AI编码会话及自动检查、Agent导航、规范等问题；审核通过的改进可供下一轮使用，取消项目末尾强制复盘阶段。
- 通用Skill筛选后保留`handoff`、`grilling`、`domain-modeling`、`research`、`wizard`，增加官方`pr`与`to-questionnaire`；删除仅转调grilling的重复`grill-me`入口。
- 右上角「项目目录树」来自`docs/data/project-directory-tree.txt`：按阶段步骤显示已存在输入、预期输出、模块循环和按需目录，配有中文注释。**这是结构设计，不是已自动生成全部文件。**
