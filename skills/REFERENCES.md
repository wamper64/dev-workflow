# 当前 Skill 参考来源与具体采用机制

本文件说明**现行机制**的参考来源、具体学习点与项目适配范围。Matt官方原版Skill保持不改；自建Skill的机制以本仓库对应文件为准。

## 主流程与内部依赖

| Skill | 类型 | 参考了什么 | 实际用途或改造边界 |
|---|---|---|---|
| `setup-matt-pocock-skills` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md) 先探测已有AGENTS.md、GLOSSARY、ADR、issue tracker，再让用户确认；初始化配置要和项目已有结构合并，而不是覆盖 | 完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `project-baseline` | 自建 | [1](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) 借鉴交付前必须有证据的验证门禁，把基线约束的数值/口径和禁止边界变为可审查检查项；项目分类、前置表和资料提取为本项目工作流适配，不是原仓库自带功能 | 从真实PRD、原型、代码和环境提取可量化、可判定的工程约束；自动预填只问缺口，批准后定稿，不重新定义业务需求或技术设计。 |
| `architecture-baseline` | 基于Matt改造 | [1](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md) 学习architecture spine：专门锁定后续独立开发单元必须共同遵守的系统级职责、数据Owner和交互不变量，而不是重复每个模块的具体实现。；[2](https://github.com/arc42/arc42-template/blob/master/README.adoc) 参考架构沟通应覆盖多种视角，拆开整体组件、运行/部署、质量约束与关键交互，不以单张基础设施图替代系统设计。；[3](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) 在架构设计内部调用grilling决策树与domain-modeling术语/ADR；只追问真正影响全局的未决问题。 | 形成总体组件/工程结构及关键端到端业务链路双核心；结合架构骨架、多视角、现有代码接缝与Grill，仅按真实Web/IoT/Agent/第三方需求启用组件，并冻结Owner和交互契约。 |
| `data-architecture` | 基于Matt改造 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) 学习领域术语歧义澄清、不变量与具体边界场景验证，转化为核心对象、字段语义、状态及关系定义；上游并未提供这套数据库总体三核心模板；[2](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md) 学习跨模块统一的架构spine、Owner与契约思想；具体核心数据流程、ER字段契约和S05/S09边界为本仓库自建 | 围绕整体数据规则、关键数据生命周期、核心表/字段/ER确定跨模块数据契约；模块细节交S09、DDL执行交S12。 |
| `development-environment` | 自建 | [1](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) 只有真实运行命令、健康和连通检查有证据才能声称初次部署完成，配置生成不算执行。 | 读取项目原有单机Docker八节配置，逐环境自动预填、提出待确认项，分别获批后按8.1执行，真实验收只启动授权基础服务。 |
| `module-discovery` | Matt适配 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) 研究原版Process 3 Tracer bullet纵向切片、blocking edges、Process 4 Quiz粒度/依赖审核及Process 5发布Tracker的边界：S07复用前三者用于模块级规划，不在模块划分阶段提前发布单上下文开发Ticket；S11才完整使用原版。；[2](https://github.com/addyosmani/agent-skills/blob/main/skills/incremental-implementation/SKILL.md) 借鉴可验收端到端能力和小批量交付原则，使项目模块可以按依赖在不同轮次中交付，不复制另一套Tracker或强制一次性生成全部Tickets。 | 以业务职责、核心对象生命周期和独立验收划分全项目模块；借鉴tracer bullet、阻塞边与Quiz，不在此提前发布开发Tickets。 |
| `module-design` | 基于Matt改造 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md) 实现前以现有代码接缝确定接口和职责，必要的领域术语按GLOSSARY继承，模块详细设计只细化本轮模块；[2](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) 将Grill嵌入模块设计内部，只对本轮未决的接口、业务状态和模块边界提问；跨全局变更返回整体架构审核。；[3](https://github.com/backnotprop/pstack/blob/main/skills/architect/SKILL.md) 学习先追踪既有系统的真实调用与状态责任，再对模块接口/类型/模块边界作有代价的设计草图，并在实现中发现错误时重新设计；用于模块级设计，不替代整体组件及交互架构。 | 选择本轮独立任务并核验依赖，继承整体组件、核心字段/ER和已有前后端代码，深化业务状态、页面、API、局部数据字段与迁移设计草案；按需内部Grill。 |
| `to-spec` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md) 对已经讨论清楚的设计进行综合，重点包含用户故事、实施/测试决定和排除项；本Skill本身不再次发起访谈，所以Grill必须提前 | 直接使用Matt原版to-spec，综合已确认任务的用户故事、实施及测试决定和非目标。 |
| `to-tickets` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md) Ticket按可演示的跨数据库/API/UI/测试垂直切片拆分，并声明阻塞边和批准粒度；拒绝只拆前端、只拆后端的横向任务 | 直接使用Matt原版to-tickets，按已确认Spec生成可验证的纵向Tickets及真实阻塞依赖。 |
| `implement-spec` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md) 由implement-spec内部完成TDD与code-review并返回真实代码及通过证据，后续只衔接人工未覆盖场景。；[2](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md) 学习先识别真实系统启动、健康、用户操作路径、证据和退出/清理，再用能真实运行的浏览器/API脚本验证用户可观察结果；这里只借鉴验证标准，不强制生成额外Skill。；[3](https://github.com/backnotprop/pstack/blob/main/skills/poteto-mode/playbooks/visual-parity.md) 学习把现有页面当视觉基线，在可运行的浏览器上固定相同状态、尺寸并做截图差异，禁止修改原始基线以让比较通过；有截图/真实浏览器环境才声称视觉校验完成。 | 直接使用Matt原版implement-spec：Ticket任务图、TDD、集成分支与最终代码审查。 |
| `code-review` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md) Matt原版明确只有Standards和Spec双轴并行评审，并非完整原型视觉验收；最终UI交互由后续联调/人工测试负责 | 完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `system-acceptance` | 自建 | [1](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md) 验证系统业务链的角色场景和既有回归，区分测试生成、真实执行与最终业务签收；[2](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md) 学习使用真实用户触发路径证明业务结果，并保留接口、页面与持久化状态的证据；不能只运行mock或内部setter便宣布端到端通过。；[3](https://github.com/addyosmani/agent-skills/blob/main/skills/browser-testing-with-devtools/SKILL.md) 学习用实际浏览器状态和网络请求证实页面行为；当工具/现场系统不可用时标人工待测试或受阻，不冒充实际通过。 | 依真实项目PRD的角色×核心场景组织跨模块主/异常链、权限、状态与业务签收，不使用固定报价菜单验收。 |
| `release-readiness` | 自建 | [1](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) 目标和实测分离，逐项查证性能、安全及回滚是否达到已批准基线；[2](https://github.com/addyosmani/agent-skills/blob/main/skills/constraint-driven-development/SKILL.md) 学习把已确认项目基线中的质量阈值变成可执行检查契约；未达标不得通过削弱阈值或跳过测试获得假绿灯。 | 以真实项目基线的负载、资源、安全、留存和恢复目标对照实测证据做上线评审。 |
| `release-preflight` | 自建 | [1](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) 发布前必须实测备份可恢复、迁移可预演和回滚可执行，不拿脚本代替验证 | 核验真实目标机、不可变版本和发布包，演练迁移、备份恢复、回滚或前向修复并留可核验结果。 |
| `release-delivery` | 自建 | [1](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) 上线成功须有部署日志、版本、冒烟结果和真实服务可用的证据 | 按已批准发布版本与预演执行生产部署，以本项目核心场景冒烟、监控、恢复与交付签收收口。 |
| `retro` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md) 复盘AI编码会话应落到Agent导航、自动检查、规范、工具成本等可实际改动的执行环境，机械错误优先写CI/linters而不是加空泛规则 | 直接使用Matt原版retro复盘编码Agent环境，不替代人工业务签收。 |
| `grill-with-docs` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) 问题按决策依赖树的前沿分轮提出、每项给推荐，事实由Agent调查，用户裁定后再行动；[2](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) 随讨论澄清术语，仅真实高代价取舍记录ADR | 完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `diagnosing-bugs` | Matt原版 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md) 逐字对齐六阶段：反馈环→复现最小化→3–5个排序假设→针对性插桩→修复回归→清理，第一阶段需真实执行过能捕捉原始症状的命令。 | 完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。 |
| `manual-testing` | 自建 | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md) 区分ready-for-agent和ready-for-human：手工测试、外部访问和判断型工作应明确交还人，不在Agent内部虚构；[2](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md) 以真实观察和HITL反馈构造可复现闭环，修复后用同一症状验证；[3](https://github.com/backnotprop/pstack/blob/main/skills/create-verification-skill/SKILL.md) 真实运行用户路径与可定位证据，无法真实执行的验证需要显式登记 | 基于implement-spec真实自动化和代码审查证据识别必要人测，AI只生成待执行用例，人员实际回填、复测和签收。 |

## 跨阶段通用入口

只有未在前两个研发阶段直接/内部固定调用的技能作为通用入口；辅助依赖仍按Matt原版保留。

| Skill | 参考机制 | 使用场景 |
|---|---|---|
| `grill-me` | [1](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) 原版仅转调grilling；适用于无工作目录的讨论，避免和工程内置Grill重复。 | 在没有代码工作目录的想法讨论中，按决策树逐轮询问并给建议；有仓库时主流程用grill-with-docs。 |
| `improve-codebase-architecture` | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md) 原版优先热点与深模块设计，复用codebase-design参考；不是自动大规模重构。 | 从真实代码热点寻找浅模块和接口接缝问题，生成HTML候选报告，选定后才进入具体改造。 |
| `handoff` | [1](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md) 只在跨工具/目录/协作者或fork副任务时形成文件，且保存到系统临时目录而非工作区；复用现有Spec/ADR链接并脱敏 | 跨Harness/目录/协作者切换时保存去敏的上下文接力；同会话一般不必调用 |
| `triage` | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/triage/SKILL.md) 五种状态角色和分类，核实原始报告；仅处理新来需求或外部PR而非to-tickets产物。 | 对外部Issue/PR验证、去重、分类、状态流转与补充Agent Brief；不分诊本流程自动创建的Tickets。 |
| `prototype` | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/prototype/SKILL.md) 原版分LOGIC/ UI两类，原型为试验代码，不直接合入正式业务代码。 | 对难以仅凭讨论判断的逻辑状态或UI决策生成可运行临时原型，不改动已确认正式原型样式。 |
| `implement` | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md) 原版implement适合按一个Ticket/小变更实施；主流程的implement-spec按任务图实现整份Spec。 | 单张Ticket或小范围明确需求可直接调用Matt原版implement，采用TDD并做Code Review；整份Spec仍用implement-spec。 |
| `wayfinder` | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md) 决策票不同于实现票，Map只做规划；完成后转to-spec而非直接开发。 | 目标清楚但路线不明确、跨多会话的大型工作，建立Map并逐张解决决策Ticket；不取代模块拆分。 |
| `research` | [1](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md) 调研以官方文档、源码和规范为主，每条关键主张能追溯到归属原始来源 | 使用官方/一手来源调查技术事实并沉淀带来源的Markdown文件 |

## 通用参考

- **BMAD Method**：参考跨模块契约和角色场景验收；本仓库以真实PRD和工程确定具体边界。
- **arc42**：参考系统上下文、组件、运行与部署等多视角表达，不强制创建无关章节。
- **Superpowers / verification-before-completion**：真实测试、部署及恢复必须有执行证据；未知、无权限和未执行均不得写成通过。
- **单机Docker部署模板**：具体项目的`code/deploy/single-node-docker/初次部署配置.md`八节与8.1执行提示词为准；初始化模板不能替代真实部署包。

Matt官方许可证说明见[LICENSE-Matt-Pocock.txt](LICENSE-Matt-Pocock.txt)。
