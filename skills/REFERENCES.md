# Skill 来源与参考

## 使用原则
- Matt原版：完整保留上游 SKILL.md，不更名为自建版；后期跟踪上游更新。
- 基于Matt改造：参考其设计理念，本项目新增专用的独立 Skill，不能称为 Matt 官方。
- 自建：参考已核实的 GitHub 开源项目思想，自定义实现内容与审核边界。

- `input-readiness`（自建）：[obra/superpowers / skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)；步骤：输入就绪确认
- `setup-matt-pocock-skills`（Matt原版）：[mattpocock/skills / skills/engineering/setup-matt-pocock-skills/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md)；步骤：初始化项目
- `project-baseline`（自建）：[github/spec-kit / templates/commands/plan.md](https://github.com/github/spec-kit/blob/main/templates/commands/plan.md)；步骤：项目基线
- `architecture-baseline`（基于Matt改造）：[mattpocock/skills / skills/engineering/codebase-design/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)；步骤：整体架构设计
- `data-architecture`（基于Matt改造）：[mattpocock/skills / skills/engineering/domain-modeling/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md)；步骤：数据库设计（总体）
- `development-environment`（自建）：[obra/superpowers / skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)；步骤：开发环境部署
- `module-discovery`（自建）：[bmad-code-org/BMAD-METHOD / README.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/README.md)；步骤：模块拆分
- `iteration-planning`（自建）：[obra/superpowers / skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md)；步骤：选择本轮模块并校验依赖
- `module-design`（基于Matt改造）：[mattpocock/skills / skills/engineering/codebase-design/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)；步骤：完成本轮模块详细设计
- `to-spec`（Matt原版）：[mattpocock/skills / skills/engineering/to-spec/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)；步骤：生成当前模块 Spec
- `to-tickets`（Matt原版）：[mattpocock/skills / skills/engineering/to-tickets/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md)；步骤：拆分纵向 Tickets 和依赖
- `implement-spec`（Matt原版）：[mattpocock/skills / skills/engineering/implement-spec/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/implement-spec/SKILL.md)；步骤：TDD 驱动实现及前后端联动
- `code-review`（Matt原版）：[mattpocock/skills / skills/engineering/code-review/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md)；步骤：代码审查与原型一致性审核
- `module-integration-acceptance`（自建）：[obra/superpowers / skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)；步骤：完成模块集成联调与验收
- `iteration-close`（自建）：[bmad-code-org/BMAD-METHOD / README.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/README.md)；步骤：收口本轮并进入下一轮（可选 retro）
- `system-acceptance`（自建）：[obra/superpowers / skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)；步骤：全项目业务链路和权限回归
- `release-readiness`（自建）：[github/spec-kit / templates/commands/plan.md](https://github.com/github/spec-kit/blob/main/templates/commands/plan.md)；步骤：非功能指标及上线评审
- `release-preflight`（自建）：[obra/superpowers / skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)；步骤：生产环境核验、部署预演与回滚准备
- `release-delivery`（自建）：[obra/superpowers / skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)；步骤：生产部署、验收与交付
- `retro`（Matt原版）：[mattpocock/skills / skills/engineering/retro/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)；步骤：调用 retro 复盘 AI 编码会话
- `project-retrospective`（基于Matt改造）：[mattpocock/skills / skills/engineering/retro/SKILL.md](https://github.com/mattpocock/skills/blob/main/skills/engineering/retro/SKILL.md)；步骤：复盘完整研发流程并沉淀 Skill 改进
