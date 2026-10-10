# Skills 参考来源与实际学习内容（仅研发研究说明，不作为安装Skill正文）

每条记录都指向具体GitHub原文，并说明借鉴的操作机制。Matt原版直接保留完整文件；自建/改造的技术方案须结合报价项目PRD、已有code/fld原型与若依框架校正，不能只改Skill格式。

| Skill | 使用方式 | 参考源文件及具体学到的机制 |
|---|---|---|
| `input-readiness` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：把目录存在、内容可用、版本已确认拆成可证实的事实；无证据不能宣布输入就绪 |
| `setup-matt-pocock-skills` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)：先探测已有AGENTS.md、GLOSSARY、ADR、issue tracker，再让用户确认；初始化配置要和项目已有结构合并，而不是覆盖 |
| `project-baseline` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：将技术栈、保存年限、CPU/内存/磁盘闭合、并发/P95/RPO/RTO变为必须以数值和证据验收的约束；具体覆盖以此前提供的dev-baseline Skill为基线 |
| `architecture-baseline` | 基于Matt改造 | [原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)：把需要多个模块共同遵守的难以逆转的决策固定为整体架构的骨架，逐项考虑已有代码、运行单元、协作和部署边界；[原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)：模块边界和交互必须基于现有代码组织与真实职责，不能为新的理论架构重造既有若依框架 |
| `data-architecture` | 基于Matt改造 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)：先澄清业务术语和领域责任，数据域按权威归属与不变量划分，而非菜单或表名；[原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)：确定跨模块必须共享的数据边界，把可以推迟的字段/索引等实现决定留到模块详细设计 |
| `development-environment` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：以真实连接、版本、命令及健康输出而非主观描述验证开发环境 |
| `module-discovery` | 自建 | [原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-architecture/SKILL.md)：由业务闭环与跨模块责任识别真实模块，让界面/数据库职责与架构协调，避免人为预设模块数量 |
| `iteration-planning` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)：按可执行小交付及依赖界定本轮边界，只承诺当前能验证的任务 |
| `module-design` | 基于Matt改造 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)：实现前以现有代码接缝确定接口和职责，必要的领域术语按GLOSSARY继承，模块详细设计只细化本轮模块 |
| `to-spec` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)：对已经讨论清楚的设计进行综合，重点包含用户故事、实施/测试决定和排除项；本Skill本身不再次发起访谈，所以Grill必须提前 |
| `to-tickets` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)：Ticket按可演示的跨数据库/API/UI/测试垂直切片拆分，并声明阻塞边和批准粒度；拒绝只拆前端、只拆后端的横向任务 |
| `implement-spec` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)：Spec→依赖图Tickets→可执行frontier→TDD实现→集成分支→内置code-review，再额外进行阶段质量关卡 |
| `code-review` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)：Matt原版明确只有Standards和Spec双轴并行评审，并非完整原型视觉验收；最终UI交互由后续联调/人工测试负责 |
| `module-integration-acceptance` | 自建 | [原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/skills/bmad-qa-generate-e2e-tests/SKILL.md)：检测原有测试框架，对已有API和UI生成实际可运行的E2E/接口测试并总结覆盖盲区；[原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)：与代码审查、人工业务观察分离，不把模拟测试认定真实接口联调 |
| `iteration-close` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：以真实验收、缺陷和已运行证据决定能否关闭本轮，而不是看代码已提交 |
| `system-acceptance` | 自建 | [原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)：验证系统业务链的角色场景和既有回归，区分测试生成、真实执行与最终业务签收 |
| `release-readiness` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：目标和实测分离，逐项查证性能、安全及回滚是否达到已批准基线 |
| `release-preflight` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：发布前必须实测备份可恢复、迁移可预演和回滚可执行，不拿脚本代替验证 |
| `release-delivery` | 自建 | [原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：上线成功须有部署日志、版本、冒烟结果和真实服务可用的证据 |
| `retro` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)：复盘AI编码会话应落到Agent导航、自动检查、规范、工具成本等可实际改动的执行环境，机械错误优先写CI/linters而不是加空泛规则 |
| `project-retrospective` | 基于Matt改造 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)：保留真实会话问题与可测试的Agent环境改进，并在项目级复盘中分析阶段和返工原因 |
| `grill-with-docs` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md)：问题按决策依赖树的前沿分轮提出、每项给推荐，事实由Agent调查，用户裁定后再行动；[原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)：随讨论澄清术语，仅真实高代价取舍记录ADR |
| `human-acceptance` | 自建 | [原文](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/docs/build/test-completed-work.md)：自动生成API/E2E测试不等于代码审查，也不等于人对界面和业务的实际观察；因此人工测试必须成为独立关卡；[原文](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)：每个通过声明必须有本次实际执行证据；人工测试的用例初态为待执行，不能由AI预填成功 |
| `diagnosing-bugs` | Matt原版 | [原文](https://github.com/mattpocock/skills/blob/main/skills/engineering/diagnosing-bugs/SKILL.md)：先构造能抓到用户原始症状的快速red-capable反馈环，再定位根因，不允许靠观察代码猜故障 |

## 关键审查结论

- **Grill**：Matt的 `grill-with-docs` 是 `grilling` 与 `domain-modeling` 的入口。先建依赖决策树并针对当前前沿逐轮询问，用户裁决后才写重要ADR；已确认PRD、项目基线和术语不重复提问。
- **代码审查边界**：Matt `code-review` 只有Standards和Spec双轴；UI原型视觉/实际浏览器、真实业务权限测试另走自动联调与人工验收。
- **AI与人工测试分工**：参考BMad API/E2E测试生成与Superpowers“证据先于完成声明”；人类签收只能由人实际操作填写，不能由AI预填通过。
- **Bug反馈环**：Matt `diagnosing-bugs` 先产生能抓住用户原始症状的red-capable复现反馈环，再定位根因；修复后回实现、评审、自动联调与人工复测。
- **handoff**：用于跨工具/跨目录/协作者或分叉任务的上下文交接，默认写OS临时目录、引用已有Spec/ADR/Commit、敏感信息脱敏，不应每阶段强制调用。
- **现有技能成熟度**：项目基线已按提供的完整工程基线Skill方案完善；其他新深化的Skill标为可评审初版，需要项目实际执行验证后再称成熟。

这些内容只作为网页来源说明和研究记录，不进入Skills可安装ZIP的 `SKILL.md`。