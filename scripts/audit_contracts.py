#!/usr/bin/env python3
"""标准项目研发导航的可执行契约检查：阻止重复步骤、演示混入Skill以及固定项目路径。"""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/"docs/data/quotation.json").read_text(encoding="utf-8"))
catalog=json.loads((ROOT/"skills/catalog.json").read_text(encoding="utf-8"))
workspace=json.loads((ROOT/"skills/workspace.json").read_text(encoding="utf-8"))
steps=[s for p in data["phases"] for s in p["steps"]]
lookup={s["id"]:s for s in steps}
skills={s["id"] for s in catalog}
errors=[]
def require(v,msg):
    if not v: errors.append(msg)
require(len(lookup)==len(steps)==20 and len(data["phases"])==4,"阶段或步骤数量不一致")

# 复制提示词只指定Skill和当前任务；具体规则与验收条件应由Skill及其模板维护。
for item in steps:
    skill_id=item.get("skillId")
    prompt=item.get("prompt","")
    if skill_id:
        require(prompt.startswith("/"+skill_id),item["id"]+" 不是Slash调用")
        require(75<=len(prompt)<850,item["id"]+" 执行提示词缺任务目的或过长")
        require(prompt.split("\n",1)[0].strip()=="/"+skill_id,item["id"]+" 第一行应为准确的Skill调用")
        require("SKILL.md" not in prompt and "【真实输出】" not in prompt and "【审核/不通过路径】" not in prompt,
                item["id"]+" 提示词重复Skill/网页栏目")
        require((ROOT/"skills"/skill_id/"SKILL.md").is_file(),item["id"]+" 找不到主Skill")
    elif item["id"]=="S01":
        require(bool(prompt) and not prompt.startswith("/"),"S01独立只读核验保留自然语言提示词")
# 根据每个步骤实际职责审核委托信息，不强制统一标题或相同字数。
prompt_intents={
    "S02":("研发协作入口","Tracker","沿用默认五标签"),
    "S03":("工程约束","自动预填","确认"),
    "S04":("总体组件","关键端到端业务链路","判断规则"),
    "S05":("数据骨架","核心表","ER 图"),
    "S06":("初次部署配置.md","逐环境","尚未授权"),
    "S07":("业务模块池","生命周期","依赖"),
    "S09":("本轮","依赖","现有原型"),
    "S10":("任务","业务目标","Spec"),
    "S11":("Spec","Tickets","发布前"),
    "S12":("Spec","前端原型","TDD"),
    "S14H":("人工验收","自动测试","待执行"),
    "S14B":("具体问题","实际现象","正常预期","现有证据"),
    "S15":("AI 编码工作","关联证据","我批准"),
    "S16":("整个项目","已确认PRD","已覆盖"),
    "S17":("上线条件","项目基线","测量证据"),
    "S18":("目标生产环境","回滚","不直接发布"),
    "S19":("生产发布","实际命令","交付清单"),
}
require(set(prompt_intents)=={x["id"] for x in steps if x.get("skillId")},"目标校验清单与正式技能步骤不一致")

# 根据真实适用情形使用多份示例，不机械要求每个Skill都有相同的格式。
expected_variants={"S06":2,"S09":3,"S10":2,"S14H":2,"S14B":5,"S15":2,"S16":2}
for step_id,count in expected_variants.items():
    item=lookup[step_id]
    variants=item.get("promptExamples",[])
    require(len(variants)==count,step_id+" 的提示词场景数不匹配")
    require(bool(variants) and item["prompt"]==variants[0]["prompt"],step_id+" 默认场景与主提示词不一致")
    names=[v["label"] for v in variants]
    require(len(names)==len(set(names)),step_id+" 示例标签重复")
    for v in variants:
        require(v.get("prompt","").startswith("/"+item["skillId"]+"\n\n"),step_id+" 示例缺准确的Slash调用")
        require(90<=len(v.get("prompt",""))<=1400,step_id+" 示例缺问题或过长")
        require("SKILL.md" not in v.get("prompt",""),step_id+" 示例不应复制Skill内部规则")
require(not lookup["S11"].get("promptExamples"),"没有真正场景分支时无须机械增加多份提示词")


# 入口位置不得缩窄Matt诊断Skill：检查至少四类独立来源和回归去向。
diagnosis=lookup["S14B"]
diagnosis_skill=next(x for x in catalog if x["id"]=="diagnosing-bugs")
bug_variants=diagnosis.get("promptExamples",[])
require(len(bug_variants)>=5,"Bug诊断应提供故障描述模板及多场景示例")
for term in ("CI","页面业务功能","设备","生产"):
    require(any(term in x["label"] or term in x["prompt"] for x in bug_variants),"Bug诊断缺具体场景："+term)
for term in ("实际现象","正常预期","复现方式","现有证据"):
    require(term in diagnosis["prompt"],"默认Bug提示词未描述实际问题："+term)
require("不必等人工测试单" in data["phases"][2]["description"],"模块迭代阶段未声明Bug诊断可独立触发")
require("仅故障来自人工测试时" in " ".join(diagnosis["inputs"]),"人工测试单应是Bug诊断可选输入")
require("不要求所有故障都有人工用例" in " ".join(diagnosis["outputs"]),"Bug诊断产物错误绑定人工用例")
diagnosis_overview=diagnosis_skill.get("overview",{})
require(len(diagnosis_overview.get("quickFacts",[]))>=4,"Bug快速理解未展示多来源和返回路径")
require(len(diagnosis_overview.get("thinking",[]))>=4,"Bug快速理解未覆盖CI、设备、人工及生产场景")
require(len(diagnosis_overview.get("sections",[]))==6,"官方六阶段不能被改写或增加成专属工作流")
require("问题来源不限于" not in diagnosis["prompt"],"提示词不应罗列Skill支持的场景来替代故障描述")

for step_id,keywords in prompt_intents.items():
    require(all(word in lookup[step_id]["prompt"] for word in keywords),
            step_id+" 执行提示词缺少本步骤目标、边界或交付语义")
renderer_source=(ROOT/"docs/app.js").read_text(encoding="utf-8")
require('prompt:"/"+w.id+' in renderer_source and "toolkitTaskPrompts" in renderer_source,
        "通用工具缺简短Slash任务提示")

require(len(catalog)==19 and len(workspace)==8,"主Skill或工具箱数量错误")
# Skill视图统一拥有信息图，架构设计继续采用不可替换的用户原始PNG。
for record in [*catalog,*workspace]:
    if record["id"]=="architecture-baseline":
        continue
    image=ROOT/"docs/images/skills"/(record["id"]+".svg")
    require(image.is_file(),"缺少Skill流程图："+record["id"])
    if image.is_file():
        svg=image.read_text(encoding="utf-8")
        require("<svg" in svg and "</svg>" in svg and "<script" not in svg.lower(),"Skill流程图内容不安全："+record["id"])
require(data["title"]=="标准项目研发导航","导航标题未标准化")
require(not data.get("modules"),"标准导航不可预设报价项目模块")
require(len(data["iterationFlow"])==len(data["phases"][2]["steps"])==7,"模块迭代流程长度不同步")
for s in steps:
    if s["id"].startswith("S00"): continue
    manual=s["id"]=="S01"
    require(bool(s.get("manual"))==manual,s["id"]+" 手工/提示词标记错误")
    if manual:
        require(not s.get("skillId") and not s.get("skills"),s["id"]+" 不能拥有独立Skill")
        require(bool(s.get("prompt")) if s["id"]=="S01" else not s.get("prompt"),s["id"]+" 提示词状态错误")
    else:
        require(s.get("skillId") in skills and s.get("skills")==[s.get("skillId")],s["id"]+" Skill无效")
        require(bool(s.get("prompt")),s["id"]+" 缺提示词")
    require(bool(s.get("inputs")) and bool(s.get("outputs")),s["id"]+" 缺输入输出")
    for value in s["inputs"]+s["outputs"]:
        require("code/fld" not in value and "code/guiwu_ruoyi" not in value,s["id"]+" 仍限定报价项目的code子目录")
for key in ("input-readiness","human-acceptance"):
    require(key not in skills and not (ROOT/"skills"/key).exists(),key+" 旧Skill应删除")
require("docs/input/" in " ".join(lookup["S01"]["inputs"]) and "code/" in " ".join(lookup["S01"]["inputs"]),"输入核对没覆盖原始目录")
# S03项目基线只能定义约束；先动态前置确认，所有从需求抽取的可量化目标要有数值/单位/口径。
baseline=(ROOT/"skills/project-baseline/SKILL.md").read_text(encoding="utf-8")
baseline_dir=ROOT/"skills/project-baseline"
for ref in ("references/constraint-discovery.md", "references/applicability.md",
            "assets/preconfirmation-template.md", "assets/baseline-template.md",
            "references/checklist.md", "references/quantification-standard.md"):
    require((baseline_dir/ref).is_file(),"S03缺配套文件："+ref)
# S03最新裁定：先在对话预填并补齐，正式仅交付已确认约束，不能强制附加前置文件。
for token in ("不写需求", "不做设计", "可量化", "可判定", "项目特有约束", "对话内", "自动预填", "只问缺失"):
    require(token in baseline,"S03约束缺失："+token)
require("项目基线.md" in " ".join(lookup["S03"]["outputs"]),"S03正式产物缺失")
require("项目基线前置约束确认表.md" not in " ".join(lookup["S03"]["outputs"]),"S03重新引入已删除的前置确认文件")
require("项目基线.md" in " ".join(next(x for x in catalog if x["id"]=="project-baseline")["outputs"]),"S03元数据未同步")
require("补齐输入不落盘" in baseline and "唯一交付物" in baseline,"S03把会话问答误写成独立产物")
inputs_check=(baseline_dir/"scripts/check_inputs.py").read_text(encoding="utf-8")
require('root / "code"' in inputs_check and "code/fld" not in inputs_check and "guiwu_ruoyi" not in inputs_check,"S03输入检查不能限定报价项目路径")
require("只问缺失" in baseline and "自动预填" in baseline,"S03主Skill没有限定自动预填和只处理输入缺口")

require("grill-with-docs" in (ROOT/"skills/architecture-baseline/SKILL.md").read_text(encoding="utf-8") and "grill-with-docs" in (ROOT/"skills/module-design/SKILL.md").read_text(encoding="utf-8"),"S04和S09主Skill缺内部Grill")
# S04须能真正约束后续工程结构及模块开发；不允许网站内容与正式模板分裂。
architecture=(ROOT/"skills/architecture-baseline/SKILL.md").read_text(encoding="utf-8")
architecture_template=(ROOT/"skills/architecture-baseline/assets/architecture-template.md").read_text(encoding="utf-8")
for ref in ("architecture-applicability.md","engineering-contract.md","freeze-and-change.md"):
    require((ROOT/"skills/architecture-baseline/references"/ref).is_file(),"S04缺参考文件："+ref)
for token in ("工程组织","允许依赖","架构冻结","角色×核心场景","grill-with-docs"):
    require(token in architecture or token in architecture_template,"S04契约缺失："+token)
for token in ("2.1.3 工程组织","2.3.1 核心链路目录", "2.5 双核心互检","A/B/C架构冻结清单"):
    require(token in architecture_template,"S04正式模板缺失："+token)
require("专项" in architecture and "冻结" in architecture,"S04主Skill未定义专项及冻结")
require("冻结" in (ROOT/"skills/module-design/SKILL.md").read_text(encoding="utf-8"),"S09未继承架构冻结规则")
# S04快速理解不允许只有笼统分类；必须列出具体决策项、产物及可判断的完成条件。
s04_overview=next(x["overview"] for x in catalog if x["id"]=="architecture-baseline")
require(s04_overview.get("visual", {}).get("src")=="./images/architecture-baseline.png", "S04必须使用上传的原始PNG")
s04_png = ROOT/"docs/images/architecture-baseline.png"
require(s04_png.is_file(), "S04原始PNG缺失")
require(__import__("hashlib").sha256(s04_png.read_bytes()).hexdigest()=="aaab1523bf4e3c003defc65549f9436036ac246c57747c70c3d5ba2dfee5d0a9", "S04原图被替换或压缩")
require(len(s04_overview["sections"])==11,"S04快速理解板块数量异常")
for section in s04_overview["sections"]:
    require(len(section.get("checks",[]))>=4,"S04具体项不够："+section["title"])
    require(bool(section.get("deliverable")) and bool(section.get("pass")),"S04交付/完成判定缺失："+section["title"])
require(len(s04_overview.get("quickFacts",[]))==4,"S04快速理解双核心概览不完整")
require(len(s04_overview.get("pillars",[]))==2,"S04快速理解必须明确两大核心")
require(len(s04_overview.get("chainExample",{}).get("steps",[]))>=6,"S04快速理解缺少业务处理链示意")
require({s.get("axis") for s in s04_overview["sections"]}=={"component","flow","support"},"S04没有将11个具体项按双核心和支撑约束分组")
flows=(ROOT/"skills/architecture-baseline/references/core-business-flows.md").read_text(encoding="utf-8")
require("链路→组件" in flows and "组件→链路" in flows,"S04核心业务链与组件双向核验标准缺失")
require("关键端到端业务链路" in architecture and "处理流程图" in architecture_template,"S04主Skill和模板未落实两大核心")
renderer=(ROOT/"docs/app.js").read_text(encoding="utf-8")
for token in ("skill-topic-details","skill-topic-delivery","skill-topic-gate","skill-quick-facts"):
    require(token in renderer,"快速理解渲染逻辑缺失："+token)


# S05数据库总体必须真正完成三核心，S09不得重复构建全局核心表。
data_skill=(ROOT/"skills/data-architecture/SKILL.md").read_text(encoding="utf-8")
data_tpl=(ROOT/"skills/data-architecture/assets/data-architecture-template.md").read_text(encoding="utf-8")
data_gate=(ROOT/"skills/data-architecture/references/data-boundary-gate.md").read_text(encoding="utf-8")
for ref in ("references/three-core-contract.md","assets/data-architecture-template.md","references/data-boundary-gate.md"):
    require((ROOT/"skills/data-architecture"/ref).is_file(),"S05缺三核心配套文件："+ref)
for token in ("整体数据规则","关键数据业务流程","核心表","核心字段","S09"):
    require(token in data_skill and token in data_tpl,"S05契约/模板缺少三核心："+token)
require("grill-with-docs" in data_skill,"S05内部Grill未继承")
for token in ("第一轮","第二轮","核心字段","S09"):
    require(token in data_gate,"S05门禁缺少："+token)
s05_overview=next(x["overview"] for x in catalog if x["id"]=="data-architecture")
require(len(s05_overview.get("pillars",[]))==3,"S05快速理解缺三个核心")
require({s.get("axis") for s in s05_overview["sections"]}=={"rule","flow","structure","support"},"S05缺三核心及支撑分组")
for section in s05_overview["sections"]:
    require(len(section.get("checks",[]))>=4 and bool(section.get("deliverable")) and bool(section.get("pass")),"S05具体项/产物/判定缺失："+section["title"])
for token in ("整体数据规则","关键数据业务流程","核心表","核心字段","ER"):
    require(token in data_skill or token in data_tpl,"S05主Skill或模板缺少："+token)
module_skill=(ROOT/"skills/module-design/SKILL.md").read_text(encoding="utf-8")
require("数据库总体" in module_skill and "先返回数据库总体设计" in module_skill,"S09未继承S05冻结")
require("整体架构" in module_skill and "数据库总体" in module_skill,"S09主Skill未继承总体架构和数据库契约")
for token in ("pillarsTitle","pillarsDescription","data-count"):
    require(token in renderer,"三核心快速理解页面缺少："+token)

require("人工测试用例与结果.md" not in " ".join(lookup["S12"]["outputs"]),"S12原版不生成人工测试单")
require(lookup["S12"]["skillId"]=="implement-spec" and not lookup["S12"].get("invokes"),"S12须直接用Matt原版")
require("code-review" in (ROOT/"skills/implement-spec/SKILL.md").read_text(encoding="utf-8") and "tdd" in (ROOT/"skills/implement-spec/SKILL.md").read_text(encoding="utf-8").lower(),"原版implement-spec缺TDD或Code Review")
require(lookup["S15"]["skillId"]=="retro" and not lookup["S15"].get("invokes"),"S15须直接使用Matt原版retro")
require(all(p["id"] != "P04" for p in data["phases"]),"最后不应有重复retro阶段")
require("project-retrospective" not in skills and not (ROOT/"skills/project-retrospective").exists(),"旧最终复盘Skill仍存在")
expected_workspace=["grill-me","improve-codebase-architecture","handoff","triage","prototype","implement","wayfinder","research"]
require([x["id"] for x in workspace]==expected_workspace,"通用Skills名单或排序错误")
for duplicate in ("grill-with-docs","tdd","grilling","domain-modeling","diagnosing-bugs","code-review","to-spec","to-tickets"):
    require(duplicate not in expected_workspace,"通用入口重复主流程："+duplicate)
for helper in ("grilling","domain-modeling","tdd","code-review","codebase-design"):
    require((ROOT/"skills"/helper/"SKILL.md").is_file(),"Matt依赖缺失："+helper)
require(lookup["S14H"]["skillId"]=="manual-testing" and "人工测试用例与结果.md" in " ".join(lookup["S14H"]["outputs"]),"S14H应有独立人工测试Skill")
require("Phase 1" in (ROOT/"skills/diagnosing-bugs/SKILL.md").read_text(encoding="utf-8"),"官方Bug诊断缺六阶段")
require("初次部署配置.md" in " ".join(lookup["S06"]["inputs"]) and "8.1" in (ROOT/"skills/development-environment/SKILL.md").read_text(encoding="utf-8"),"S06主Skill未定义配置模板及8.1执行")
require(lookup["S07"]["skillId"]=="module-discovery" and "模块拆分" in lookup["S07"]["title"],"模块拆分主Skill或标题不一致")
require(all(x in (ROOT/"skills/module-discovery/SKILL.md").read_text(encoding="utf-8").lower() for x in ("tracer bullet","blocking edges","quiz")),"S07主Skill缺模块拆分来源与审核机制")
require("to-tickets" in lookup["S11"]["skills"],"本轮开发任务必须保持Matt原版to-tickets")
require(not (ROOT/"skills/module-discovery/SKILL.md").read_text(encoding="utf-8").count("不发布全项目开发Tickets")==0,"模块规划必须禁止提前发布开发Ticket")

for skill in catalog:
    root=ROOT/"skills"/skill["id"]
    require((root/"SKILL.md").is_file(),skill["id"]+" 无SKILL.md")
    require(not (root/"examples").exists(),skill["id"]+" 示例混进安装目录")
    for key in ("outputSampleFile","consultationFile"):
        loc=skill.get(key)
        if loc: require(loc.startswith("docs/examples/报价项目/") and (ROOT/loc).is_file(),skill["id"]+" 独立示例路径错误")
    require(bool(skill.get("referenceLearnings")) and bool(skill.get("adaptation")),skill["id"]+" 缺来源机制/采用说明")
tree=(ROOT/"docs/data/project-directory-tree.txt").read_text(encoding="utf-8")
for expected in ("模块验收与状态记录.md","人工测试用例与结果.md","初次部署配置-<环境名称>.md","项目基线.md","上线记录.md","code/","docs/"):
    require(expected in tree,"项目目录树遗漏："+expected)
for utility in workspace:
    require((ROOT/"skills"/utility["id"]/"SKILL.md").is_file(),utility["id"]+" 工具箱Skill丢失")
# 当前七步迭代和双关卡初次部署
require([s["id"] for s in data["phases"][2]["steps"]]==["S09","S10","S11","S12","S14H","S14B","S15"],"模块迭代步骤顺序错误")
for old in ("iteration-planning","dev-implement-spec","iteration-close"):
    require(not (ROOT/"skills"/old).exists(),"旧包装Skill仍存在："+old)
require((ROOT/"skills/manual-testing/SKILL.md").is_file(),"缺少人工测试Skill")
require("模块验收与状态记录.md" in " ".join(lookup["S14H"]["outputs"]),"缺人工签收")
require(".scratch/<feature-slug>/spec.md" in " ".join(lookup["S10"]["outputs"]),"Matt独立任务Spec定位须由真实Tracker决定")
dev=(ROOT/"skills/development-environment/SKILL.md").read_text(encoding="utf-8")
for word in ("初次部署配置.md","初次部署配置-<环境名称>.md","8.1","确认","nginx"):
    require(word in dev,"S06关键规则缺失："+word)
require("devFields" not in renderer and "environmentForm()" not in renderer,"S06旧环境手填表未移除")

# 快速理解须按Skill真实契约列流程、具体项、产物、缺失信号与完成判定。
for skill_id,minimum_sections,minimum_coverage in (
    ("development-environment",6,12),
    ("module-design",8,9),
    ("to-spec",8,7),
    ("to-tickets",6,7),
    ("implement-spec",8,8),
    ("manual-testing",4,8),
    ("diagnosing-bugs",6,7),
    ("retro",8,8),
):
    item=next(x for x in catalog if x["id"]==skill_id)
    overview=item.get("overview",{})
    require(len(overview.get("sections",[]))>=minimum_sections,skill_id+" 快速理解缺实际内容板块")
    require(len(overview.get("coverage",[]))>=minimum_coverage,skill_id+" 速查项不足")
    require(len(overview.get("workflow",{}).get("steps",[]))>=5,skill_id+" 缺流程图步骤")
    for field in overview.get("sections",[]):
        require(bool(field.get("checks")) and bool(field.get("deliverable")) and bool(field.get("pass")),skill_id+" 缺具体检查、产物或判定")
    for item2 in overview.get("coverage",[]):
        require(all(item2.get(key) for key in ("title","must","evidence","gap")),skill_id+" 有空白覆盖维度")
deployment_overview=next(x["overview"] for x in catalog if x["id"]=="development-environment")
require(len(deployment_overview.get("workflow",{}).get("gates",[]))==2,"初次部署必须可视化配置审批和执行验收两关")
require("quick-route-checkpoints" in renderer,"网页未支持多关卡快速理解")
setup_overview=next(x["overview"] for x in catalog if x["id"]=="setup-matt-pocock-skills")
setup_text=json.dumps(setup_overview,ensure_ascii=False)
for label in ("needs-triage","needs-info","ready-for-agent","ready-for-human","wontfix"):
    require(label in setup_text,"初始化快速理解缺标签定义："+label)
require("是，沿用默认五标签" in setup_text,"初始化快速理解未提示推荐选择")
require("/triage" in setup_text and "人工测试签收" in setup_text,"五标签的生效条件或业务测试边界不清")
require("沿用默认五标签" in lookup["S02"]["prompt"],"初始化提示词未保留已确认的五标签选择")
for step_obj in steps:
    require(len(step_obj["title"])<=12,"执行步骤标题过长："+step_obj["id"])

# 来自用户的完整八节初次部署模板，在新项目初始化时可用，但不能替代真实部署包。
seed=(ROOT/"templates/project/code/deploy/single-node-docker/初次部署配置.md")
require(seed.is_file(),"缺少首次部署的项目初始化配置模板")
if seed.is_file():
    raw=seed.read_text(encoding="utf-8")
    for section in ("## 1. 部署服务清单","## 2. 开机自启动配置","## 3. 服务器连接配置","## 4. 端口配置","## 5. 数据库和中间件账号密码","## 6. FTP 文件存储配置","## 7. 初始化 SQL 配置","## 8. AI 执行要求","### 8.1 推荐提示词","### 8.2 AI 根据本文档执行部署步骤","### 8.3 验收标准及文档"):
        require(section in raw,"首次部署模板缺失："+section)


# 当前有效契约的逆向审查：不让历史流程、示例和错误路径回到正式导航。
active_skill_text=" ".join((ROOT/"skills"/p/"SKILL.md").read_text(encoding="utf-8")
    for p in ("module-discovery","module-design","system-acceptance","release-readiness","release-preflight","release-delivery"))
require("S08" not in active_skill_text,"已合并的S08仍残留在正式Skill")
require("S08" not in json.dumps(data,ensure_ascii=False) and "S08" not in json.dumps(catalog,ensure_ascii=False),"已取消步骤S08仍在导航或快速理解中出现")
require("17个菜单" not in active_skill_text and "17个菜单" not in json.dumps(data,ensure_ascii=False),"案例菜单数泄漏到通用执行流程")
for retired in ("input-readiness","human-acceptance","project-retrospective"):
    require(not (ROOT/"docs"/"examples"/"报价项目"/retired).exists(),"已取消步骤的案例目录仍存在："+retired)
require((ROOT/"docs/研发流程输入输出与质量门禁.md").is_file(),"缺当前输入输出契约文档")
require(not (ROOT/"docs/research/skill-sources.md").exists(),"重复旧来源页未清理")
require(not (ROOT/"docs/输入输出契约与对抗性审查.md").exists(),"存在旧版本输入输出契约")
for source in (ROOT/"README.md",ROOT/"skills/REFERENCES.md",ROOT/"docs/研发流程输入输出与质量门禁.md"):
    text_now=source.read_text(encoding="utf-8")
    require(not __import__("re").search(r"(?m)^##?\s+20[0-9]{2}-[0-9]{2}",text_now),"说明文档混入按日期追加的历史章节："+source.name)
for key in ("inputs","outputs"):
    combined=" ".join(str(s.get(key,[])) for s in steps)+" "+ " ".join(str(x.get(key,[])) for x in catalog)
    require("docs/output/04-开发环境/部署步骤与执行记录.md" not in combined,"虚构的旧开发环境产物被引用")
expected_sys=set(lookup["S16"]["outputs"])
declared_sys=(ROOT/"skills/system-acceptance/SKILL.md").read_text(encoding="utf-8")
require(all(path in declared_sys for path in expected_sys),"系统验收Skill与导航正式产物不一致")
require(lookup["S09"]["skillId"]=="module-design" and "S09" in (ROOT/"skills/module-discovery/SKILL.md").read_text(encoding="utf-8"),"S07至S09交接不完整")


# 全部自建文档、当前模板与网站配置不得继续引用已失效的步骤或产物。
stale_terms=(
    "S08", "dev-implement-spec", "docs/output/04-开发环境/部署步骤与执行记录.md",
    "全流程验收报告.md", "17个菜单", "docs/research/skill-sources.md",
)
active_documents=[ROOT/"README.md", ROOT/"skills/REFERENCES.md",
    ROOT/"docs/data/quotation.json", ROOT/"skills/catalog.json",
    ROOT/"docs/data/project-directory-tree.txt"]
active_documents+=list((ROOT/"docs").rglob("*.md"))
active_documents+=list((ROOT/"templates").rglob("*.md"))
for name in ("architecture-baseline","data-architecture","development-environment",
             "manual-testing","module-design","module-discovery","project-baseline",
             "release-delivery","release-preflight","release-readiness","system-acceptance"):
    active_documents+=list((ROOT/"skills"/name).rglob("*.md"))
active_documents=list(dict.fromkeys(active_documents))
for doc in active_documents:
    content=doc.read_text(encoding="utf-8")
    for term in stale_terms:
        require(term not in content,"过时引用出现在现行文档："+str(doc.relative_to(ROOT))+" -> "+term)
    require(not __import__("re").search(r"(?m)^#{1,4}\s+20[0-9]{2}-[0-9]{2}",content),
            "文档不应按日期追加版本历史："+str(doc.relative_to(ROOT)))


if errors:
    for m in errors: print("FAIL:",m)
    raise SystemExit(1)
print(f"PASS: {len(data['phases'])}阶段、{len(steps)}步骤、{len(catalog)}主Skill、{len(workspace)}通用Skill；原版实现/复盘与独立人测、首次部署完整。")
