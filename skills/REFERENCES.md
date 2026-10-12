# Skill 采用与来源说明

此文档只描述**当前仓库实际采用的Skill及参考机制**，不是改动日志。Matt官方原版文件保持原文，自建/改造部分明确区分“借鉴机制”和“本项目自行制定的规则”。

## 一、研发主流程与内部Skills

| Skill | 类型 | 参考来源 | 具体学习的机制 / 当前使用方式 |
|---|---|---|---|
| `setup-matt-pocock-skills` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md) | 先探测已有AGENTS.md、GLOSSARY、ADR、issue tracker，再让用户确认；初始化配置要和项目已有结构合并，而不是覆盖；本仓库采用：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `project-baseline` | 自建 | [来源](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 借鉴交付前必须有证据的验证门禁，把基线约束的数值/口径和禁止边界变为可审查检查项；项目分类、前置表和资料提取为本项目工作流适配，不是原仓库自带功能；本仓库采用：将原直接形成定量基线改为『自动提取→动态前置确认→裁定→正式约束』；区分需求/约束/设计；整机边界在S03、组件预算在S04；按需专项和项目独有禁止事项覆盖Web、IoT、Agent混合项目。 |
| `architecture-baseline` | 基于Matt改造 | [来源](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md) | 学习architecture spine：专门锁定后续独立开发单元必须共同遵守的系统级职责、数据Owner和交互不变量，而不是重复每个模块的具体实现。；参考架构沟通应覆盖多种视角，拆开整体组件、运行/部署、质量约束与关键交互，不以单张基础设施图替代系统设计。；在架构设计内部调用grilling决策树与domain-modeling术语/ADR；只追问真正影响全局的未决问题。；复用真实已有代码和接口接缝，避免只为理论架构新增薄包装组件或重复实现。；本仓库采用：PRD与全部docs/input构建组件清单及交互清单，内部调用Grill并保留必要术语/ADR；借鉴BMAD架构骨架的跨团队一致性契约、arc42的组件/运行/交互视角与Matt的决策依赖树，但按定制前后端/Agent+报价系统扩展到六Worker和人工确认/iframe；非已裁定信息明确标候选。；本次在已有全局组件设计基础上，增加真实工程接缝与复用依赖、专项适用性判定、A/B/C冻结及业务覆盖/代码可落地双关卡，不增加步骤或重写Matt原版。 |
| `data-architecture` | 基于Matt改造 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) | 学习领域术语歧义澄清、不变量与具体边界场景验证，转化为核心对象、字段语义、状态及关系定义；上游并未提供这套数据库总体三核心模板；学习跨模块统一的架构spine、Owner与契约思想；具体核心数据流程、ER字段契约和S05/S09边界为本仓库自建；本仓库采用：从Matt domain-modeling借鉴术语/不变量澄清，从BMAD借鉴跨模块共享契约；本仓库自行改造为三核心：全局规则→数据生命周期→核心表字段与ER。S05锁跨模块身份/版本/引用，S09补模块细节，S12执行SQL。 |
| `development-environment` | 自建 | [来源](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 只有真实运行命令、健康和连通检查有证据才能声称初次部署完成，配置生成不算执行。；本仓库采用：依据用户提供的单机Docker首次部署配置八节模板：自动预填项目事实、逐环境独立配置、未决推荐与人工确认、确认后使用8.1原有提示词，首次不部署应用。借鉴Superpowers真实验证，不照搬外部部署技术栈。 |
| `module-discovery` | Matt适配 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) | 研究原版Process 3 Tracer bullet纵向切片、blocking edges、Process 4 Quiz粒度/依赖审核及Process 5发布Tracker的边界：S07复用前三者用于模块级规划，不在模块划分阶段提前发布单上下文开发Ticket；S11才完整使用原版。；借鉴可验收端到端能力和小批量交付原则，使项目模块可以按依赖在不同轮次中交付，不复制另一套Tracker或强制一次性生成全部Tickets。；本仓库采用：以Matt Pocock Skills官方to-tickets为主参考，**明确做项目模块级适配**：采用tracer-bullet纵向交付、blocking edges/依赖DAG、quiz人工粒度审核；原版单上下文Ticket、Issue Tracker发布属于S11而不在S07执行。进一步保留当前工作区必需的项目PRD角色×场景覆盖、既有原型/代码映射和整体架构组件及数据Owner约束。 |
| `module-design` | 基于Matt改造 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md) | 实现前以现有代码接缝确定接口和职责，必要的领域术语按GLOSSARY继承，模块详细设计只细化本轮模块；将Grill嵌入模块设计内部，只对本轮未决的接口、业务状态和模块边界提问；跨全局变更返回整体架构审核。；学习先追踪既有系统的真实调用与状态责任，再对模块接口/类型/模块边界作有代价的设计草图，并在实现中发现错误时重新设计；用于模块级设计，不替代整体组件及交互架构。；本仓库采用：运用Matt深模块、Interface/Seam的设计原则，以已有原型/若依为约束详化业务状态、页面动作、REST、表字段、迁移设计草案。 已内置Grill并要求每个模块设计引用总体组件及交互ID，禁止越过已批准骨架。 |
| `to-spec` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md) | 对已经讨论清楚的设计进行综合，重点包含用户故事、实施/测试决定和排除项；本Skill本身不再次发起访谈，所以Grill必须提前；本仓库采用：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `to-tickets` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) | Ticket按可演示的跨数据库/API/UI/测试垂直切片拆分，并声明阻塞边和批准粒度；拒绝只拆前端、只拆后端的横向任务；本仓库采用：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `implement-spec` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md) | 由implement-spec内部完成TDD与code-review并返回真实代码及通过证据，后续只衔接人工未覆盖场景。；学习先识别真实系统启动、健康、用户操作路径、证据和退出/清理，再用能真实运行的浏览器/API脚本验证用户可观察结果；这里只借鉴验证标准，不强制生成额外Skill。；学习把现有页面当视觉基线，在可运行的浏览器上固定相同状态、尺寸并做截图差异，禁止修改原始基线以让比较通过；有截图/真实浏览器环境才声称视觉校验完成。；学习真实浏览器DOM、console、Network、截图与页面互动测试，不用源码静态推断冒充用户可见行为；工具不可用则将场景留入待人工测试单。；本仓库采用：原版未改；当前直接作为S12主Skill，不包装也不额外做人工测试。 |
| `code-review` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md) | Matt原版明确只有Standards和Spec双轴并行评审，并非完整原型视觉验收；最终UI交互由后续联调/人工测试负责；本仓库采用：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `system-acceptance` | 自建 | [来源](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md) | 验证系统业务链的角色场景和既有回归，区分测试生成、真实执行与最终业务签收；学习使用真实用户触发路径证明业务结果，并保留接口、页面与持久化状态的证据；不能只运行mock或内部setter便宣布端到端通过。；学习用实际浏览器状态和网络请求证实页面行为；当工具/现场系统不可用时标人工待测试或受阻，不冒充实际通过。；本仓库采用：采用BMAD交付后测试的角色/场景视角，但由项目PRD反向生成跨模块主/异常链和权限的系统级验收矩阵。 |
| `release-readiness` | 自建 | [来源](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 目标和实测分离，逐项查证性能、安全及回滚是否达到已批准基线；学习把已确认项目基线中的质量阈值变成可执行检查契约；未达标不得通过削弱阈值或跳过测试获得假绿灯。；本仓库采用：将Fresh Evidence规则落实为基线目标对实测值、负载条件、CPU/RSS/并发/P95、恢复指标的逐项放行。 |
| `release-preflight` | 自建 | [来源](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 发布前必须实测备份可恢复、迁移可预演和回滚可执行，不拿脚本代替验证；本仓库采用：将执行前证据验证应用于生产机资源、数据库迁移预演、备份恢复和回滚演练，明确不可逆SQL的阻断。 |
| `release-delivery` | 自建 | [来源](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | 上线成功须有部署日志、版本、冒烟结果和真实服务可用的证据；本仓库采用：将验证前审计应用于真实客户服务器的发布版本、生产冒烟、监控观察和交付签收，未授权不宣称上线。 |
| `retro` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md) | 复盘AI编码会话应落到Agent导航、自动检查、规范、工具成本等可实际改动的执行环境，机械错误优先写CI/linters而不是加空泛规则；本仓库采用：原版未改；S15直接执行，不承担S14H中的人工验收签收。 |
| `grill-with-docs` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) | 问题按决策依赖树的前沿分轮提出、每项给推荐，事实由Agent调查，用户裁定后再行动；随讨论澄清术语，仅真实高代价取舍记录ADR；本仓库采用：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `diagnosing-bugs` | Matt原版 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md) | 逐字对齐六阶段：反馈环→复现最小化→3–5个排序假设→针对性插桩→修复回归→清理，第一阶段需真实执行过能捕捉原始症状的命令。；本仓库采用：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `manual-testing` | 自建 | [来源](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md) | 区分ready-for-agent和ready-for-human：手工测试、外部访问和判断型工作应明确交还人，不在Agent内部虚构；以真实观察和HITL反馈构造可复现闭环，修复后用同一症状验证；真实运行用户路径与可定位证据，无法真实执行的验证需要显式登记；本仓库采用：独立填补人工验收，Matt原版implement-spec和retro正文不改动。 |

## 二、跨阶段按需工具

| 原版 Skill | 官方来源 | 具体借鉴与用途 |
|---|---|---|
| `grill-me` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) | 原版仅转调grilling；适用于无工作目录的讨论，避免和工程内置Grill重复。 |
| `improve-codebase-architecture` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md) | 原版优先热点与深模块设计，复用codebase-design参考；不是自动大规模重构。 |
| `handoff` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md) | 只在跨工具/目录/协作者或fork副任务时形成文件，且保存到系统临时目录而非工作区；复用现有Spec/ADR链接并脱敏 |
| `triage` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md) | 五种状态角色和分类，核实原始报告；仅处理新来需求或外部PR而非to-tickets产物。 |
| `prototype` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md) | 原版分LOGIC/ UI两类，原型为试验代码，不直接合入正式业务代码。 |
| `implement` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md) | 原版implement适合按一个Ticket/小变更实施；主流程的implement-spec按任务图实现整份Spec。 |
| `wayfinder` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md) | 决策票不同于实现票，Map只做规划；完成后转to-spec而非直接开发。 |
| `research` | [Matt原版](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md) | 调研以官方文档、源码和规范为主，每条关键主张能追溯到归属原始来源 |

## 三、研究参考与当前项目化边界

- [Matt Pocock Skills](https://github.com/mattpocock/skills)：原版 `grilling`、`grill-with-docs`、`to-spec`、`to-tickets`、`implement-spec`、`tdd`、`code-review`、`retro` 等用于相应步骤；借鉴拆票的纵向可验证与真实依赖，不声称Matt自带全项目模块规划或完整数据库总体模板。
- [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD)：借鉴整体架构不变量（组件职责、Owner和交互）及交付检查，具体Skill/实现参见表格；项目三核心数据库与两级设计边界由本仓库确定。
- [arc42](https://arc42.org/)：借鉴多视角架构沟通，区别组件、关键行为链路、部署和质量要求；不是直接使用其成品代码。
- [Superpowers](https://github.com/obra/superpowers)：借鉴verification-before-completion真实证据原则，用在环境、测试与上线放行；不是将它当成项目基线的现成模板。
- [Addy Osmani Agent Skills](https://github.com/addyosmani/agent-skills)：借鉴增量纵向交付及可执行验证，实际模块边界仍按业务职责/对象生命周期确定。

**审查原则**：来源只能证明设计借鉴的机制，不能证明自建Skill已经在真实客户环境中通过验收。
