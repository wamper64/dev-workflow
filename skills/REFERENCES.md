# Skill学习来源、实际借鉴点及改造边界

本文件是网站展示/调研索引，不属于运行时Skill正文。已检查下方引用的上游SKILL.md原文，Matt原版完整保留；改造内容仅代表本仓库的定制前后端项目流程。

## 一、研发主流程Skill
### input-readiness（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：把目录存在、内容可用、版本已确认拆成可证实的事实；无证据不能宣布输入就绪
- **完全引用或实际改造内容**：将“没有证据不能宣称完成”落实为已签PRD/原型/若依三个必需项+可选环境/对接资料的阻塞分级。

### setup-matt-pocock-skills（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/setup-matt-pocock-skills/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)：先探测已有AGENTS.md、GLOSSARY、ADR、issue tracker，再让用户确认；初始化配置要和项目已有结构合并，而不是覆盖
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### project-baseline（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：将技术栈、保存年限、CPU/内存/磁盘闭合、并发/P95/RPO/RTO变为必须以数值和证据验收的约束；具体覆盖以此前提供的dev-baseline Skill为基线
- **完全引用或实际改造内容**：只借用证据门禁原则。成熟的项目基线Skill及其量化模板、澄清过程、结构化验证维持不变。

### architecture-baseline（基于Matt改造）
- **原始Skill**：[bmad-code-org/BMAD-METHOD/skills/bmad-architecture/SKILL.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)：把需要多个模块共同遵守的难以逆转的决策固定为整体架构的骨架，逐项考虑已有代码、运行单元、协作和部署边界
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)：模块边界和交互必须基于现有代码组织与真实职责，不能为新的理论架构重造既有若依框架
- **完全引用或实际改造内容**：保留BMAD的全局架构脊柱，采用Matt深模块和测试接缝术语，将其约束为现有前端原型/若依服务、消息/REST交互、权限、资源预算的全局契约。

### data-architecture（基于Matt改造）
- **原始Skill**：[mattpocock/skills/skills/engineering/domain-modeling/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)：先澄清业务术语和领域责任，数据域按权威归属与不变量划分，而非菜单或表名
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)：确定跨模块必须共享的数据边界，把可以推迟的字段/索引等实现决定留到模块详细设计
- **完全引用或实际改造内容**：使用领域术语与写入Owner的职责界定法，做总体数据域/一致性/容量/留存设计，模块字段索引及SQL延迟到详细设计。

### development-environment（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：以真实连接、版本、命令及健康输出而非主观描述验证开发环境
- **完全引用或实际改造内容**：证据驱动探测本机已有依赖/容器/端口，按实际缺项安装并实测前后端/API/数据库；不复制参考库的语言和运行环境。

### module-discovery（自建）
- **原始Skill**：[bmad-code-org/BMAD-METHOD/skills/bmad-architecture/SKILL.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)：由业务闭环与跨模块责任识别真实模块，让界面/数据库职责与架构协调，避免人为预设模块数量
- **完全引用或实际改造内容**：把BMAD的全局一致性要求转成PRD角色场景→页面→数据责任→模块Owner反向矩阵及依赖DAG，避免按菜单机械切分。

### iteration-planning（自建）
- **原始Skill**：[obra/superpowers/skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)：按可执行小交付及依赖界定本轮边界，只承诺当前能验证的任务
- **完全引用或实际改造内容**：从小步可执行计划借鉴阻塞和最小交付策略，改成已审核模块清单中选择可独立验收的纵向切片。

### module-design（基于Matt改造）
- **原始Skill**：[mattpocock/skills/skills/engineering/codebase-design/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)：实现前以现有代码接缝确定接口和职责，必要的领域术语按GLOSSARY继承，模块详细设计只细化本轮模块
- **完全引用或实际改造内容**：运用Matt深模块、Interface/Seam的设计原则，以已有原型/若依为约束详化业务状态、页面动作、REST、表字段、迁移设计草案。

### to-spec（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/to-spec/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)：对已经讨论清楚的设计进行综合，重点包含用户故事、实施/测试决定和排除项；本Skill本身不再次发起访谈，所以Grill必须提前
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### to-tickets（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/to-tickets/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)：Ticket按可演示的跨数据库/API/UI/测试垂直切片拆分，并声明阻塞边和批准粒度；拒绝只拆前端、只拆后端的横向任务
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### implement-spec（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/implement-spec/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)：Spec→依赖图Tickets→可执行frontier→TDD实现→集成分支→内置code-review，再额外进行阶段质量关卡
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### code-review（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/code-review/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)：Matt原版明确只有Standards和Spec双轴并行评审，并非完整原型视觉验收；最终UI交互由后续联调/人工测试负责
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### module-integration-acceptance（自建）
- **原始Skill**：[bmad-code-org/BMAD-METHOD/skills/bmad-qa-generate-e2e-tests/SKILL.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-qa-generate-e2e-tests/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-qa-generate-e2e-tests/SKILL.md)：检测原有测试框架，对已有API和UI生成实际可运行的E2E/接口测试并总结覆盖盲区
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)：与代码审查、人工业务观察分离，不把模拟测试认定真实接口联调
- **完全引用或实际改造内容**：BMAD自动API/E2E测试只作为参考，改成真实RuoYi/Vue联调、原型结构和视觉核对、Mock与真实证据分流、向人工移交。

### iteration-close（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：以真实验收、缺陷和已运行证据决定能否关闭本轮，而不是看代码已提交
- **完全引用或实际改造内容**：应用验证前核验证据原则，把Review→自动联调→人工验收→Bug闭环与项目实施状态、下一轮依赖联动。

### system-acceptance（自建）
- **原始Skill**：[bmad-code-org/BMAD-METHOD/docs/build/test-completed-work.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)：验证系统业务链的角色场景和既有回归，区分测试生成、真实执行与最终业务签收
- **完全引用或实际改造内容**：采用BMAD交付后测试的角色/场景视角，但由项目PRD反向生成跨模块主/异常链和权限的系统级验收矩阵。

### release-readiness（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：目标和实测分离，逐项查证性能、安全及回滚是否达到已批准基线
- **完全引用或实际改造内容**：将Fresh Evidence规则落实为基线目标对实测值、负载条件、CPU/RSS/并发/P95、恢复指标的逐项放行。

### release-preflight（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：发布前必须实测备份可恢复、迁移可预演和回滚可执行，不拿脚本代替验证
- **完全引用或实际改造内容**：将执行前证据验证应用于生产机资源、数据库迁移预演、备份恢复和回滚演练，明确不可逆SQL的阻断。

### release-delivery（自建）
- **原始Skill**：[obra/superpowers/skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：上线成功须有部署日志、版本、冒烟结果和真实服务可用的证据
- **完全引用或实际改造内容**：将验证前审计应用于真实客户服务器的发布版本、生产冒烟、监控观察和交付签收，未授权不宣称上线。

### retro（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/retro/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)：复盘AI编码会话应落到Agent导航、自动检查、规范、工具成本等可实际改动的执行环境，机械错误优先写CI/linters而不是加空泛规则
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### project-retrospective（基于Matt改造）
- **原始Skill**：[mattpocock/skills/skills/engineering/retro/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)：保留真实会话问题与可测试的Agent环境改进，并在项目级复盘中分析阶段和返工原因
- **完全引用或实际改造内容**：沿用Matt retro的经验归因方法，但扩展到跨项目Grill、设计返工、人工Bug发现和Skill门禁改进。

### grill-with-docs（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/grill-with-docs/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)：问题按决策依赖树的前沿分轮提出、每项给推荐，事实由Agent调查，用户裁定后再行动
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)：随讨论澄清术语，仅真实高代价取舍记录ADR
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

### human-acceptance（自建）
- **原始Skill**：[bmad-code-org/BMAD-METHOD/docs/build/test-completed-work.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)
- **从参考具体学习**：[源文件](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)：自动生成API/E2E测试不等于代码审查，也不等于人对界面和业务的实际观察；因此人工测试必须成为独立关卡
- **从参考具体学习**：[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：每个通过声明必须有本次实际执行证据；人工测试的用例初态为待执行，不能由AI预填成功
- **完全引用或实际改造内容**：将BMAD自动覆盖与人工Walkthrough职责区分，要求开发人员按真实角色操作，项目经理按角色×场景确认，Bug驱动复测。

### diagnosing-bugs（Matt原版）
- **原始Skill**：[mattpocock/skills/skills/engineering/diagnosing-bugs/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md)
- **从参考具体学习**：[源文件](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md)：先构造能抓到用户原始症状的快速red-capable反馈环，再定位根因，不允许靠观察代码猜故障
- **完全引用或实际改造内容**：完整保留上游官方SKILL.md及触发边界；本仓库只映射研发导航步骤。

## 二、工作区通用Skill（按需调用，不改原版）
### handoff（Matt原版）
- 原始Skill：[skills/productivity/handoff/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md)
- 实际学习：只在跨工具/目录/协作者或fork副任务时形成文件，且保存到系统临时目录而非工作区；复用现有Spec/ADR链接并脱敏
- 保留方式：跨Harness/目录/协作者切换时保存去敏的上下文接力；同会话一般不必调用，保留上游正文及许可。

### grilling（Matt原版）
- 原始Skill：[skills/productivity/grilling/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)
- 实际学习：按依赖树的frontier分轮提问，每轮给推荐；找事实是Agent的任务，做决策是用户的任务
- 保留方式：按依赖树决定当前可问的问题，给推荐；事实由Agent查，决策由用户确认，保留上游正文及许可。

### grill-me（Matt原版）
- 原始Skill：[skills/productivity/grill-me/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md)
- 实际学习：它只是调用grilling的薄入口，不承载独立的规格生产
- 保留方式：官方轻量入口，内部调用grilling，保留上游正文及许可。

### domain-modeling（Matt原版）
- 原始Skill：[skills/engineering/domain-modeling/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)
- 实际学习：术语现场澄清、GLOSSARY只记录概念不放实现；ADR要求难以逆转、非显然、真实取舍三个条件全部满足
- 保留方式：术语冲突现场澄清；仅不可逆、非显然、真实取舍时记录ADR，保留上游正文及许可。

### research（Matt原版）
- 原始Skill：[skills/engineering/research/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md)
- 实际学习：调研以官方文档、源码和规范为主，每条关键主张能追溯到归属原始来源
- 保留方式：使用官方/一手来源调查技术事实并沉淀带来源的Markdown文件，保留上游正文及许可。

### wizard（Matt原版）
- 原始Skill：[skills/engineering/wizard/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/wizard/SKILL.md)
- 实际学习：面向无法自动完成的人工环境配置，而不是绕过权限或假称已执行
- 保留方式：只对AI无法自动完成的环境配置逐步引导人操作，保留上游正文及许可。

## 三、学习结果如何在项目中落地
- Grill不是装饰：整体架构前S03Q、本轮详细设计前S08Q，决策树每轮给推荐且不重复已定结论。
- Matt code-review是Standards和Spec双轴；原型浏览器/视觉与人工业务测试分别在后续关卡。
- 模块详细设计只交迁移设计草案，编码阶段才生成版本化SQL并回写设计。
- 通用Handoff/Grilling/Research/Wizard在工作区按需触发，不强行规定每个项目都调用。
