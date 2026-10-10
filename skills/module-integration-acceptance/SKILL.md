---
name: module-integration-acceptance
description: 完成模块集成联调与验收。用于已有PRD、既有前端原型、若依框架的首次项目建设；本技能负责单步骤交付和证据审查。
---

# 完成模块集成联调与验收

> 类型：自建  
> 参考：obra/superpowers / skills/verification-before-completion/SKILL.md  
> 来源：[GitHub 源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)  
> 本文是针对项目场景的原创实现说明，并非上游 Skill 原文。

## 一、职责与边界

本 Skill 只负责「完成模块集成联调与验收」，从确定的输入形成可审核输出，不越权替代其他步骤。  
项目原型基线是 `code/fld/`；后端框架是 `code/guiwu_ruoyi/`。PRD 位于 `docs/input/需求资料/`，其他可选输入位于 `docs/input/工程资料/`、`docs/input/环境资料/`、`docs/input/对接资料/`。不重做已确认PRD，不独立设计另一套前端视觉与交互体系。Git提交说明使用中文。

## 二、触发条件

当前研发工作流执行到「完成模块集成联调与验收」，且存在所需输入或已记录的阻塞项时调用。无权访问或无法验证时明确给出阻塞状态，不虚构结果。

## 三、输入

- `本轮各模块代码与SQL`
- `对应Spec`
- `本轮模块计划.md`
- `角色场景PRD`

## 四、执行流程

```mermaid
flowchart TD
    N0["模块合并"]
    N1["业务主/异常链联调"]
    N2["角色验收"]
    N3["失败返工"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> G{"验收条件满足？"}
    G -- 否 --> R["记录问题 / 退回修正"]
    R --> N0
    G -- 是 --> OK["提交可追溯产物"]
```

### 执行准则

1. **模块合并**：读取对应上下文和实际证据，检查与前序项目基线的关系，记录决定和异常。
2. **业务主/异常链联调**：读取对应上下文和实际证据，检查与前序项目基线的关系，记录决定和异常。
3. **角色验收**：读取对应上下文和实际证据，检查与前序项目基线的关系，记录决定和异常。
4. **失败返工**：读取对应上下文和实际证据，检查与前序项目基线的关系，记录决定和异常。





按角色×业务场景验收，失败要保留可复现证据和回退到对应Ticket。


## 五、输出

- `docs/output/06-模块迭代/本轮联调记录.md`
- `docs/output/06-模块迭代/本轮验收记录.md`
- `端到端回归测试`

## 六、验收与中止条件

开发人员完成全链路联调；项目经理按角色×场景验收，不通过退回S19。

若输入文档不支持技术结论、第三方接口未确认、实测环境不可达，应输出待确认项并中止受阻部分。产出必须与本项目的PRD、源码和工程基线一致。

## 七、示例和模板

- [使用示例](./examples/使用示例.md)
- [输出模板](./templates/输出模板.md)

## 八、参考与差异

参考项目：obra/superpowers（[源文件](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md)）。参考其结构化验证、计划或质量关卡思想；本技能额外增加报价项目目录、前端原型守护、角色审核及可追溯产物要求。