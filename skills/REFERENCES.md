# Skill 来源与采用说明

本仓库区分 **Matt官方原版**、**参考现有开源机制的自建Skill** 和 **项目级适配**。Skill类型与用途以当前目录为准。原版SKILL.md及其配套文件不修改，参考来源不能替代真实项目的审核证据。

## 1. 主流程与内部 Skills

| Skill | 类型 | 来源与参考 | 学到的机制 | 当前职责 |
|---|---|---|---|---|
| `setup-matt-pocock-skills` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md) | 沿用官方扫描现有Agent/Tracker/Glossary/ADR、用户确认后安全写入的初始化步骤。 | 直接采用Matt官方原版，初始化Agent约定、Issue Tracker与领域文档导航；保留既有配置，按实际情况增量写入。 |
| `project-baseline` | 自建 | [主参考](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 借鉴 verification-before-completion 的可观察证据与放行约束；基线分类、自动预填和量化口径由本仓库定义。 | 自建工程约束基线：资料自动提取→仅针对缺口的前置确认→用户裁定→正式基线；要求所有指标量化或可判定，专项按实际Web/IoT/Agent场景启用。 |
| `architecture-baseline` | 基于Matt改造 | [主参考](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)、[参考1](https://github.com/arc42/arc42-template/blob/master/README.adoc)、[参考2](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)、[参考3](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md) | BMAD的组件/数据Owner不变量、arc42多视角架构描述、Matt codebase-design真实代码接缝以及grill-with-docs决策澄清。 | 自建项目总体架构流程，参考BMAD组件/Owner契约、arc42架构视图、Matt代码接缝与Grill，锁定组件及交互、关键端到端业务链路、工程复用、部署资源和架构冻结；专项按项目证据启用。 |
| `data-architecture` | 基于Matt改造 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)、[参考1](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md) | Matt domain-modeling的术语/不变量及BMAD跨模块契约；三核心数据库规则、数据生命周期、表字段及ER设计由本仓库定义。 | 自建数据库总体三核心：整体数据规则→关键数据生命周期→核心表/字段与ER关联，继承领域不变量及跨模块权威Owner；S05冻结核心契约，S09设计模块局部字段，S12实施迁移SQL。 |
| `development-environment` | 自建 | [主参考](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 借鉴 verification-before-completion 的实际运行和验收证据；部署依据是真实八节模板而非外部默认环境。 | 自建逐环境初次部署：保留真实项目八节配置模板，依据已确认基线自动预填、处理冲突、逐环境取得配置/执行授权，按模板8.1执行基础服务部署并记录真实本机及异机验收证据。 |
| `module-discovery` | Matt适配 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)、[参考1](https://github.com/addyosmani/agent-skills/blob/main/skills/incremental-implementation/SKILL.md) | Matt to-tickets的Tracer bullets、Blocked by依赖和Quiz粒度审查；用于业务模块层级，不在S07发布开发Tickets。 | 项目级适配Matt纵向交付、真实Blocked by与Quiz；以业务职责和核心对象生命周期决定模块拆合，明确独立验收、唯一Owner及模块DAG。S07只输出模块池；S11才用原版to-tickets发布实现任务。 |
| `module-design` | 基于Matt改造 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)、[参考1](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)、[参考2](https://github.com/backnotprop/pstack/blob/main/skills/architect/SKILL.md) | Matt codebase-design的深模块/接口接缝、grill-with-docs的有依据澄清；本仓库细化模块状态/API/局部数据和迁移草案。 | 自建本轮选择、依赖门禁和模块详细设计：借鉴Matt深模块、界面/接口接缝、代码复用与内部Grill；继承既有前端原型和后端框架，细化状态、页面动作、API、局部表字段及迁移设计草案。 |
| `to-spec` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md) | Matt原版的问题、方案、用户故事、实现与测试决定、非目标及Tracker发布。 | 直接采用Matt官方原版，为已经澄清的独立任务生成Spec，包含业务故事、实现/测试决定与非目标。 |
| `to-tickets` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) | Matt原版纵向可演示切片、单上下文Ticket、阻塞关系、人工Quiz与逐票发布。 | 直接采用Matt官方原版，将本任务Spec拆成纵向可验收、单上下文可实施的Tickets，声明真实阻塞边并经Quiz确认后发布。 |
| `implement-spec` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)、[参考1](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md)、[参考2](https://github.com/backnotprop/pstack/blob/main/skills/poteto-mode/playbooks/visual-parity.md)、[参考3](https://github.com/addyosmani/agent-skills/blob/main/skills/browser-testing-with-devtools/SKILL.md) | Matt原版Ticket DAG调度、独立worktree、TDD、集成合并与最终Code Review。 | 直接采用Matt官方原版，依Ticket阻塞图实施，内含TDD、合并与最终Code Review；人工测试由后续独立Skill执行。 |
| `code-review` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md) | Matt原版Standards和Spec双轴审查，不把代码评审当作人工业务签收。 | 直接采用Matt官方原版，执行Standards与Spec双轴代码审查；真实业务/视觉验收由专门测试覆盖。 |
| `system-acceptance` | 自建 | [主参考](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)、[参考1](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md)、[参考2](https://github.com/addyosmani/agent-skills/blob/main/skills/browser-testing-with-devtools/SKILL.md) | BMAD角色/场景的交付测试思路与真实端到端证据；覆盖范围来自当前项目PRD。 | 自建系统业务验收：依项目/模块PRD的角色×场景在实际入口验证跨模块主/异常链、权限、权威状态及缺陷复测；全部内容统一写入唯一的系统验收报告.md。 |
| `release-readiness` | 自建 | [主参考](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)、[参考1](https://github.com/addyosmani/agent-skills/blob/main/skills/constraint-driven-development/SKILL.md) | verification-before-completion 的验收证据原则；性能/恢复/安全阈值来自已批准项目基线。 | 自建系统验收（非功能质量）：将项目基线已批准的性能、安全、容量、保留及恢复指标映射到实测与正式上线放行门禁，与前一阶段业务验收分离。 |
| `release-preflight` | 自建 | [主参考](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | verification-before-completion 的可重复放行检查；业务迁移/备份/回滚必须有真实预演证据。 | 自建开发/测试环境预检：首次应用上线或版本更新时核对环境隔离、迁移、备份/隔离恢复与回退，仅为实际部署的内部前置门禁。 |
| `release-delivery` | 自建 | [主参考](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | verification-before-completion 的部署结果证据；版本、健康、生产冒烟、观察与客户交付真实留痕。 | 自建开发与测试环境应用上线：只支持两种环境的首次上线和版本更新四种情况；先预检再经授权部署、真实冒烟、观察与交接。 |
| `retro` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md) | Matt原版读取会话、Git/CI/工具成本，优先将重复机械错误转化成可执行守卫。 | 直接采用Matt官方原版，依据编码会话、Git和CI证据提出工程环境/工具/指令改进建议；不代替人工业务签收。 |
| `grill-with-docs` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)、[参考1](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)、[参考2](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) | Matt原版调研事实、构建决策依赖树、逐轮向用户提交高影响取舍与ADR。 | 直接采用Matt官方原版，以代码和领域资料为上下文按决策依赖树逐轮提问；高影响决定经用户裁定后记录。 |
| `diagnosing-bugs` | Matt原版 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md) | Matt原版六阶段红灯反馈、最小复现、可证伪假设、精确实验、回归与清理。 | 直接采用Matt官方原版，遵循红灯反馈环、最小复现、排序假设、定点实验、回归修复和清理的六阶段。 |
| `manual-testing` | 自建 | [主参考](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md)、[参考1](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md)、[参考2](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md) | 借鉴真实测试证据、角色场景验收和最小必要人测，结果只由执行者填写。 | 自建独立人工验收：依据真实自动测试结果筛选必须人测的角色×场景，生成待执行用例，真实人员回填、失败同用例复测并签收。 |

## 2. 按需通用 Skills

| Skill | 原版来源 | 具体作用及边界 |
|---|---|---|
| `grill-me` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) | 无工程目录的决策追问入口，直接使用grilling；有工程上下文时使用主流程的grill-with-docs。 |
| `improve-codebase-architecture` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md) | 依据真实Git热点及深模块接缝输出HTML候选报告；需codebase-design支持，不默认执行重构。 |
| `handoff` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md) | 跨会话、协作者与工具保存准确上下文指针、尚未完成的决定与交接边界。 |
| `triage` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md) | 对外部Issue/PR检查重复、复现证据和状态；不重复分诊to-tickets自身创建的实现票。 |
| `prototype` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md) | 用单次临时交互式逻辑或UI原型验证明确问题，不替换已批准正式原型。 |
| `implement` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md) | 执行单个Ticket的TDD和Review；整份Spec的任务图使用implement-spec。 |
| `wayfinder` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md) | 复杂目标跨会话的决策Map、阻塞前沿与逐条决策，不代替业务模块划分。 |
| `research` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md) | 优先一手资料与真实源码调研，结论给来源、边界与证据。 |

## 3. 适用边界

- **项目模块与开发Tickets不同**：S07按业务职责、对象生命周期、场景和Owner形成模块池，S11依据当前任务Spec生成实现级Tickets。
- **全局设计与模块细化不同**：S03定义硬约束，S04定义组件及业务链路，S05定义核心数据规则/对象/表字段/ER，S09仅细化本轮并尊重上游冻结。
- **规划、执行与验收不同**：Spec/Tickets是实施计划，implement-spec负责真实TDD/Review，manual-testing由人工回填结果；部署配置不代表真实执行成功。
- **案例不是通用默认值**：报价、IoT、Agent、审批、六Worker等都必须由当前项目PRD、实际代码或正式架构确认后才能启用。
