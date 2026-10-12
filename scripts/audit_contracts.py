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
require(len(lookup)==len(steps)==21 and len(data["phases"])==4,"阶段或步骤数量不一致")
require(len(catalog)==21 and len(workspace)==7,"主Skill或工具箱数量错误")
require(data["title"]=="标准项目研发导航","导航标题未标准化")
require(not data.get("modules"),"标准导航不可预设报价项目模块")
require(len(data["iterationFlow"])==len(data["phases"][2]["steps"])==8,"模块迭代流程长度不同步")
for s in steps:
    if s["id"].startswith("S00"): continue
    manual=s["id"] in ("S01","S14H")
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
for token in ("不写需求", "不做设计", "可量化", "可判定", "项目特有约束", "前置约束确认表"):
    require(token in baseline,"S03边界/前置流程缺失："+token)
require("项目基线前置约束确认表.md" in " ".join(lookup["S03"]["outputs"]), "S03导航未输出前置表")
require("项目基线前置约束确认表.md" in lookup["S03"]["prompt"],"S03导航提示词未同步")
require("项目基线前置约束确认表.md" in " ".join(next(x for x in catalog if x["id"]=="project-baseline")["outputs"]), "S03快速理解未同步")
require("项目基线前置约束确认表.md" in (ROOT/"docs/data/project-directory-tree.txt").read_text(encoding="utf-8"),"项目目录树未同步S03")
inputs_check=(baseline_dir/"scripts/check_inputs.py").read_text(encoding="utf-8")
require('root / "code"' in inputs_check and "code/fld" not in inputs_check and "guiwu_ruoyi" not in inputs_check,"S03输入检查不能限定报价项目路径")
require("用户只填" in lookup["S03"]["prompt"] or "只填写缺失" in lookup["S03"]["prompt"], "S03未声明只询问输入缺口")

require("grill-with-docs" in lookup["S04"]["prompt"] and "grill-with-docs" in lookup["S09"]["prompt"],"Grill应内嵌")
# S04须能真正约束后续工程结构及模块开发；不允许网站内容与正式模板分裂。
architecture=(ROOT/"skills/architecture-baseline/SKILL.md").read_text(encoding="utf-8")
architecture_template=(ROOT/"skills/architecture-baseline/assets/architecture-template.md").read_text(encoding="utf-8")
for ref in ("architecture-applicability.md","engineering-contract.md","freeze-and-change.md"):
    require((ROOT/"skills/architecture-baseline/references"/ref).is_file(),"S04缺参考文件："+ref)
for token in ("工程组织","允许依赖","架构冻结","角色×核心场景","grill-with-docs"):
    require(token in architecture or token in architecture_template,"S04契约缺失："+token)
for token in ("2.1.3 工程组织","业务场景架构覆盖","A/B/C架构冻结清单"):
    require(token in architecture_template,"S04正式模板缺失："+token)
require("专项" in lookup["S04"]["prompt"] and "冻结" in lookup["S04"]["prompt"],"导航S04提示词未同步新规则")
require("冻结" in (ROOT/"skills/module-design/SKILL.md").read_text(encoding="utf-8"),"S09未继承架构冻结规则")
# S04快速理解不允许只有笼统分类；必须列出具体决策项、产物及可判断的完成条件。
s04_overview=next(x["overview"] for x in catalog if x["id"]=="architecture-baseline")
require(len(s04_overview["sections"])==11,"S04快速理解板块数量异常")
for section in s04_overview["sections"]:
    require(len(section.get("checks",[]))>=4,"S04具体项不够："+section["title"])
    require(bool(section.get("deliverable")) and bool(section.get("pass")),"S04交付/完成判定缺失："+section["title"])
require(len(s04_overview.get("quickFacts",[]))==4,"S04总览缺检查/专项/冻结/审核")
renderer=(ROOT/"docs/app.js").read_text(encoding="utf-8")
for token in ("skill-topic-details","skill-topic-delivery","skill-topic-gate","skill-quick-facts"):
    require(token in renderer,"快速理解渲染逻辑缺失："+token)


require("人工测试用例与结果.md" in " ".join(lookup["S12"]["outputs"]),"implement-spec未提供人工测试单")
require(lookup["S12"]["skillId"]=="dev-implement-spec" and lookup["S12"]["invokes"]==["implement-spec"],"实现步骤必须采用改造Skill内部调用原版")
require("code-review" in lookup["S12"]["prompt"] and "TDD" in lookup["S12"]["prompt"],"实现缺原版内置能力")
require("retro" in lookup["S15"].get("invokes",[]) and "retro" in lookup["S15"]["prompt"],"本轮收口必须内置retro")
require(all(p["id"] != "P04" for p in data["phases"]),"最后不应有重复retro阶段")
require("project-retrospective" not in skills and not (ROOT/"skills/project-retrospective").exists(),"旧最终复盘Skill仍存在")
require({x["id"] for x in workspace}=={"handoff","grilling","domain-modeling","research","wizard","pr","to-questionnaire"},"通用Skills去重与清单不一致")
require(not (ROOT/"skills/grill-me").exists(),"轻量Grill冗余入口未移除")
require("人工测试用例与结果.md" in " ".join(lookup["S14H"]["inputs"]),"人工执行未复用前序单据")
require("Phase 6" in lookup["S14B"]["prompt"],"Bug诊断没有对应六阶段")
require("开发环境信息.md" in " ".join(lookup["S06"]["inputs"]),"开发环境未从用户填表开始")
require(lookup["S07"]["skillId"]=="module-discovery" and "Matt Tickets" in lookup["S07"]["title"],"模块拆分未采用Matt Tickets项目级适配")
require("tracer bullet" in lookup["S07"]["prompt"] and "blocking edges" in lookup["S07"]["prompt"] and "quiz" in lookup["S07"]["prompt"],"模块级Tickets关键机制不完整")
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
for expected in ("本轮retro改进建议.md","人工测试用例与结果.md","项目基线.md","上线记录.md","code/","docs/"):
    require(expected in tree,"项目目录树遗漏："+expected)
for utility in workspace:
    require((ROOT/"skills"/utility["id"]/"SKILL.md").is_file(),utility["id"]+" 工具箱Skill丢失")
if errors:
    for m in errors: print("FAIL:",m)
    raise SystemExit(1)
print(f"PASS: {len(data['phases'])}阶段、{len(steps)}步骤、{len(catalog)}主Skill、{len(workspace)}通用Skill；复盘内置、目录树完整。")
