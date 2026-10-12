# Skill 学习来源、参考Skill名称和具体学习内容

> 本说明是**研发调研资料**，不作为最终安装的SKILL.md内容。仅说明已查阅的具体项目/Skill及采用理由，不能代替真实运行验证。

## 研发主流程（23个Skill）

### input-readiness（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：项目经理确认PRD可作为实施依据、可选材料可追溯、前端原型和后端框架已放置；不对若依内部代码进行技术审核。
- 完全引用或改造：将“没有证据不能宣称完成”落实为已签PRD/原型/若依三个必需项+可选环境/对接资料的阻塞分级。
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：把目录存在、内容可用、版本已确认拆成可证实的事实；无证据不能宣布输入就绪

### setup-matt-pocock-skills（官方原版，未改动）
- 项目中的实际用途：开发人员验证Matt Skills和本地Markdown任务跟踪可使用，且不破坏原工程。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — setup-matt-pocock-skills**：[Matt Pocock Skills — setup-matt-pocock-skills](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)
  - 实际学习：先探测已有AGENTS.md、GLOSSARY、ADR、issue tracker，再让用户确认；初始化配置要和项目已有结构合并，而不是覆盖

### project-baseline（量化约束提取 + 前置动态确认，保留原证据门禁原则）
- 项目中的实际用途：在已确认PRD与整体架构之间，将真实项目输入转成可量化或可客观判定的工程约束；先预填前置确认表，仅问用户关键缺口。正式基线不写需求、不做设计。
- **具体借鉴的上游机制**：来自 [Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) 的「无真实验证证据不得宣布完成」门禁思想；保留本仓库既有的指标数值/口径、约束一致性和完成审核规则。**上游没有直接提供本项目前置表或条件化基线方案。**
- **本仓库自行改造内容**：新增 constraint-discovery（需求/约束/设计三分法和需求量化抽取）、applicability（8个通用维度及条件专项）、preconfirmation-template（AI已知自动预填、只问缺口）；调整基线模板、量化标准、禁止/责任边界和整机资源上限与S04组件预算的边界。
- **对应实现文件**：`skills/project-baseline/SKILL.md`、`assets/preconfirmation-template.md`、`assets/baseline-template.md`、`references/constraint-discovery.md`、`references/applicability.md`及各审核规则。报价示例和网站S03同步更新，但示例数字均非真实项目事实。

### architecture-baseline（组件架构与核心业务链路双核心）
- **本次双核心增强**：延续BMAD architecture spine中跨模块组件/Owner/交互约束、arc42多视角、Matt codebase-design对已有代码接缝的复用；自建“关键业务链路目录→架构级处理流程→状态/异常→组件与链路双向核验”的落地规则，供定制Web、IoT、Agent与第三方集成项目复用。以上链路规则为本项目适配，不声称上游Skill要求固定告警/MQ流程。
- **落实文件**：`skills/architecture-baseline/SKILL.md`、`assets/architecture-template.md`、`references/core-business-flows.md`、`references/architecture-gate.md`、`docs/data/quotation.json`、`skills/catalog.json`、`docs/app.js`，及模块详细设计继承约束。
- **2026-10-12本次增强与具体借鉴机制**：继续借鉴BMAD architecture spine的跨模块组件/Owner/交互不变量、arc42的组件/运行/部署及跨领域视角、Matt codebase-design的真实接缝复用而非重造、Matt grill-with-docs的只询问全局高代价未决决策。本项目自行适配为“真实前后端代码落点/允许依赖”“Web/IoT/Agent/第三方按条件启用”“A/B/C冻结及双关卡”。这三项是本项目的实施规则，不冒充某个上游Skill的原文。
- **落实位置**：`skills/architecture-baseline/SKILL.md`、`assets/architecture-template.md`、`references/architecture-applicability.md`、`engineering-contract.md`、`freeze-and-change.md`及`architecture-gate.md`；同时同步网站S04与S05/S09/S12。
- 项目中的实际用途：递归读取全部docs/input，识别全项目所有主要组件/运行单元和跨组件交互，内部Grill补足决策，形成可供下游填充的完整骨架。
- 完全引用或改造：从原PRD与全部docs/input构建组件清单及交互清单，内部调用Grill并保留必要术语/ADR；借鉴BMAD架构骨架的跨团队一致性契约、arc42的组件/运行/交互视角与Matt的决策依赖树，但按定制前后端/Agent+报价系统扩展到六Worker和人工确认/iframe；非已裁定信息明确标候选。
- **BMAD Method — bmad-architecture**：[BMAD Method — bmad-architecture](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)
  - 实际学习：学习architecture spine：专门锁定后续独立开发单元必须共同遵守的系统级职责、数据Owner和交互不变量，而不是重复每个模块的具体实现。
- **arc42 — 软件架构文档模板**：[arc42 — 软件架构文档模板](https://github.com/arc42/arc42-template/blob/master/README.adoc)
  - 实际学习：参考架构沟通应覆盖多种视角，拆开整体组件、运行/部署、质量约束与关键交互，不以单张基础设施图替代系统设计。
- **Matt Pocock Skills — grill-with-docs**：[Matt Pocock Skills — grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)
  - 实际学习：在架构设计内部调用grilling决策树与domain-modeling术语/ADR；只追问真正影响全局的未决问题。
- **Matt Pocock Skills — codebase-design**：[Matt Pocock Skills — codebase-design](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)
  - 实际学习：复用真实已有代码和接口接缝，避免只为理论架构新增薄包装组件或重复实现。

### data-architecture（整体规则→关键数据业务流程→核心表/字段/ER 三核心）
- **本项目用途**：S04审批后、S07模块拆分前建立跨模块数据骨架：统一身份、精度、权限/Owner、版本与历史规则；沿S04批准的业务链画数据生命周期；最终定义具体全局核心表、必要核心字段及其类型/唯一/状态/版本/引用约束和核心ER关系图。物理存储、容量、备份和迁移作为支撑。
- **S05/S09边界**：S05必须提前锁定跨模块关键身份、核心状态版本、关联字段和Owner；S09补非核心字段、普通辅助表、索引及迁移草案；S12产生正式版本化SQL。A级变更先重审S05，牵动组件或关键业务链路再审S04。
- **Matt Pocock Skills — domain-modeling**：[官方Skill](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)
  - 具体学习：主动澄清术语、提炼不变量、用边界场景挑战概念关系；借鉴用于全局核心对象、身份、版本和关键关系。**官方原版并未提供这套三核心数据库总体设计模板**。
- **BMAD Method — bmad-architecture**：[官方Skill](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)
  - 具体学习：架构spine/跨模块共享契约的思想；应用于数据Owner、统一数据结构及变更审核。**三核心顺序、核心字段ER契约、S05与S09的冻结分工是本项目自行设计**，不能当作BMAD原有机制。
- **具体落点**：`skills/data-architecture/SKILL.md`、`assets/data-architecture-template.md`、`references/three-core-contract.md`、`references/data-boundary-gate.md`、`docs/examples/报价项目/data-architecture/`、`skills/module-design/`、`skills/catalog.json`与`docs/data/quotation.json`。

### development-environment（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：右侧用户填写真实环境信息表，导出docs/input/环境资料/开发环境信息.md，Skill按表和整体架构有序部署依赖，并记录实际执行结果。
- 完全引用或改造：证据驱动探测本机已有依赖/容器/端口，按实际缺项安装并实测前后端/API/数据库；不复制参考库的语言和运行环境。
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：以真实连接、版本、命令及健康输出而非主观描述验证开发环境

### module-discovery（Matt Pocock Tickets 的项目模块级适配）
- 项目中的实际用途：从已确认PRD的角色×核心场景发现候选，以**业务职责和核心对象完整生命周期**作为模块拆合主判据，校验权威数据/状态Owner及整体架构，再建立真实阻塞依赖DAG，供S08选择本轮模块。
- 完全引用或改造：**改造而非直接套用原版**。Matt没有独立的“全项目业务模块划分”Skill；模块与实现Ticket粒度不同，S07仅借鉴原版Process 3、4，不调用Process 5向Tracker发布任务。本仓库自建的拆合判据是业务职责、核心对象生命周期、单一权威Owner、独立验收与既有架构约束；禁止按页面/菜单/表数量机械拆分。
- **Matt Pocock Skills — to-tickets**：[Matt Pocock Skills — to-tickets](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)
  - 具体学习：Process 3 tracer-bullet纵向切片、明确blocking edges、宽范围重构的expand–contract思路；Process 4向用户Quiz拆分粒度和阻塞关系。S07在**模块级**做业务覆盖与依赖确认，S11才用官方原版根据本轮Spec生成单上下文开发Tickets。
- **Addy Osmani Agent Skills — incremental-implementation**：[Addy Osmani Agent Skills — incremental-implementation](https://github.com/addyosmani/agent-skills/blob/main/skills/incremental-implementation/SKILL.md)
  - 具体学习：按小规模可验收纵向交付的原则确定首轮可行模块，不按代码层/菜单数量机械拆分，不一次性生成所有开发Tickets。

### iteration-planning（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：开发人员判断依赖是否满足，项目经理确认本轮范围和业务验收目标。
- 完全引用或改造：从小步可执行计划借鉴阻塞和最小交付策略，改成已审核模块清单中选择可独立验收的纵向切片。
- **Superpowers — writing-plans**：[Superpowers — writing-plans](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)
  - 实际学习：按可执行小交付及依赖界定本轮边界，只承诺当前能验证的任务

### module-design（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：读取全量模块资料，继承已批准整体组件和交互骨架，内部按需Grill后只细化本轮业务状态、API、表字段与迁移草案。
- 完全引用或改造：运用Matt深模块、Interface/Seam的设计原则，以已有原型/若依为约束详化业务状态、页面动作、REST、表字段、迁移设计草案。 已内置Grill并要求每个模块设计引用总体组件及交互ID，禁止越过已批准骨架。
- **Matt Pocock Skills — codebase-design**：[Matt Pocock Skills — codebase-design](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)
  - 实际学习：实现前以现有代码接缝确定接口和职责，必要的领域术语按GLOSSARY继承，模块详细设计只细化本轮模块
- **Matt Pocock Skills — grill-with-docs**：[Matt Pocock Skills — grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)
  - 实际学习：将Grill嵌入模块设计内部，只对本轮未决的接口、业务状态和模块边界提问；跨全局变更返回整体架构审核。

### to-spec（官方原版，未改动）
- 项目中的实际用途：Spec必须能驱动开发和测试，范围、非目标、接口与决策可追溯，不重复拷贝PRD。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — to-spec**：[Matt Pocock Skills — to-spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)
  - 实际学习：对已经讨论清楚的设计进行综合，重点包含用户故事、实施/测试决定和排除项；本Skill本身不再次发起访谈，所以Grill必须提前

### to-tickets（官方原版，未改动）
- 项目中的实际用途：每张Ticket有明确验收场景、依赖与可运行结果；避免先做完全部后端再做全部页面。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — to-tickets**：[Matt Pocock Skills — to-tickets](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)
  - 实际学习：Ticket按可演示的跨数据库/API/UI/测试垂直切片拆分，并声明阻塞边和批准粒度；拒绝只拆前端、只拆后端的横向任务

### implement-spec（官方原版，未改动）
- 项目中的实际用途：Matt官方implement-spec内部依次执行Ticket、TDD、必要集成验证与code-review（Standards/Spec）；不另设代码审查或重复自动测试步骤。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — implement-spec**：[Matt Pocock Skills — implement-spec](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)
  - 实际学习：由implement-spec内部完成TDD与code-review并返回真实代码及通过证据，后续只衔接人工未覆盖场景。

### code-review（官方原版，未改动）
- 项目中的实际用途：Matt原版代码审查通过implement-spec内部调用，无独立导航步骤，仍保留完整原版Skill供查看。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — code-review**：[Matt Pocock Skills — code-review](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)
  - 实际学习：Matt原版明确只有Standards和Spec双轴并行评审，并非完整原型视觉验收；最终UI交互由后续联调/人工测试负责

### iteration-close（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：项目经理确认本轮场景完成；剩余模块返回S15，有重大AI开发问题时调用retro改进工程环境。
- 完全引用或改造：应用验证前核验证据原则，把Review→自动联调→人工验收→Bug闭环与项目实施状态、下一轮依赖联动。
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：以真实验收、缺陷和已运行证据决定能否关闭本轮，而不是看代码已提交

### system-acceptance（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：项目经理确认登录、17个菜单和完整报价主流程；缺陷返回关联模块。
- 完全引用或改造：采用BMAD交付后测试的角色/场景视角，但由项目PRD反向生成跨模块主/异常链和权限的系统级验收矩阵。
- **BMAD Method — build**：[BMAD Method — build](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)
  - 实际学习：验证系统业务链的角色场景和既有回归，区分测试生成、真实执行与最终业务签收

### release-readiness（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：技术总监评审性能/可用性/备份/安全与发布风险；没有实测不能填通过。
- 完全引用或改造：将Fresh Evidence规则落实为基线目标对实测值、负载条件、CPU/RSS/并发/P95、恢复指标的逐项放行。
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：目标和实测分离，逐项查证性能、安全及回滚是否达到已批准基线

### release-preflight（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：技术总监确认目标环境与预演结果；有破坏性SQL或无法回滚不得贸然上线。
- 完全引用或改造：将执行前证据验证应用于生产机资源、数据库迁移预演、备份恢复和回滚演练，明确不可逆SQL的阻断。
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：发布前必须实测备份可恢复、迁移可预演和回滚可执行，不拿脚本代替验证

### release-delivery（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：开发人员实际操作并留证；项目经理确认业务可用，技术总监确认正式上线结果。
- 完全引用或改造：将验证前审计应用于真实客户服务器的发布版本、生产冒烟、监控观察和交付签收，未授权不宣称上线。
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：上线成功须有部署日志、版本、冒烟结果和真实服务可用的证据

### retro（官方原版，未改动）
- 项目中的实际用途：开发人员核实每个改进都有对应证据，并优先落到自动化检查和清晰的Agent指令。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — retro**：[Matt Pocock Skills — retro](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)
  - 实际学习：复盘AI编码会话应落到Agent导航、自动检查、规范、工具成本等可实际改动的执行环境，机械错误优先写CI/linters而不是加空泛规则

### project-retrospective（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：技术总监确认流程调整优先级；项目经理核实业务沟通成本；改进不直接覆盖已审核基线。
- 完全引用或改造：沿用Matt retro的经验归因方法，但扩展到跨项目Grill、设计返工、人工Bug发现和Skill门禁改进。
- **Matt Pocock Skills — retro**：[Matt Pocock Skills — retro](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)
  - 实际学习：保留真实会话问题与可测试的Agent环境改进，并在项目级复盘中分析阶段和返工原因

### grill-with-docs（官方原版，未改动）
- 项目中的实际用途：官方Grill组合Skill，由整体架构设计及模块详细设计内部按需调用；不单独占一个工作步骤。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — grilling**：[Matt Pocock Skills — grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)
  - 实际学习：问题按决策依赖树的前沿分轮提出、每项给推荐，事实由Agent调查，用户裁定后再行动
- **Matt Pocock Skills — domain-modeling**：[Matt Pocock Skills — domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)
  - 实际学习：随讨论澄清术语，仅真实高代价取舍记录ADR

### human-acceptance（已补充执行图、失败路径和验收证据）
- 项目中的实际用途：AI只生成需求基线中自动化不能可靠证明的人工用例；人工亲测并在同一md填写结果，有Bug进入官方六阶段诊断。
- 完全引用或改造：吸收Superpowers完成必须有证据的原则，合并测试用例准备与人工结果回填，避免在implement-spec后重复TDD/独立code-review。
- **BMAD Method — build**：[BMAD Method — build](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)
  - 实际学习：自动生成API/E2E测试不等于代码审查，也不等于人对界面和业务的实际观察；因此人工测试必须成为独立关卡
- **Superpowers — verification-before-completion**：[Superpowers — verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
  - 实际学习：每个通过声明必须有本次实际执行证据；人工测试的用例初态为待执行，不能由AI预填成功

### diagnosing-bugs（官方原版，未改动）
- 项目中的实际用途：严格遵守Matt官方六阶段：构造红灯反馈环、复现最小化、3–5个可证伪假设、针对性插桩、修复/回归测试、清理。
- 完全引用或改造：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。
- **Matt Pocock Skills — diagnosing-bugs**：[Matt Pocock Skills — diagnosing-bugs](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md)
  - 实际学习：逐字对齐六阶段：反馈环→复现最小化→3–5个排序假设→针对性插桩→修复回归→清理，第一阶段需真实执行过能捕捉原始症状的命令。


## 关于用户提供的整体架构模板

- **名称**：用户之前的《整体架构设计模板》。
- **具体学习**：按“1 系统概述（边界、指标、环境、技术、外部对接）→2 总体架构（全局平铺拓扑、分层框图、组件及关系总表、关键链路、权威数据）→3 关键运行参数→4 部署、安全与运维→5 剩余问题”组织正文。
- **落地位置**：`skills/architecture-baseline/assets/architecture-template.md`。跨组件关系采用**直接标协议/方向/数据**，不以抽象编号取代图上内容。
- **补充方式**：结合 **BMAD Method — bmad-architecture** 的 architecture spine、**arc42 — 软件架构文档模板** 的多视角和 **Matt Pocock Skills — grill-with-docs** 的内部决策流程，扩展到报价项目六Worker、HITL及iframe/REST等真实对接类型。
- **范围警戒**：示例不是正式已审批架构；真实项目必须读取docs/input全部资料后确认组件、协议和服务器部署。

## 这次排除的重复做法

- Matt原版 `implement-spec` 已处理TDD和内部code-review，因此不再有单独的review或重复自动联调步骤；此前的 `module-integration-acceptance` 冗余Skill从仓库中清理。
- `human-acceptance` 只生成“待执行”人工测试用例，再由开发人员在同一张表填结果/证据；不可由AI代填通过。
- `diagnosing-bugs` 依官方原版六阶段，绝不是通用“定位→修复”的自编步骤。
