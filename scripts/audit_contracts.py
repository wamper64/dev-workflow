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
require(len(catalog)==19 and len(workspace)==8,"主Skill或工具箱数量错误")
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
for token in ("2.1.3 工程组织","2.3.1 核心链路目录", "2.5 双核心互检","A/B/C架构冻结清单"):
    require(token in architecture_template,"S04正式模板缺失："+token)
require("专项" in lookup["S04"]["prompt"] and "冻结" in lookup["S04"]["prompt"],"导航S04提示词未同步新规则")
require("冻结" in (ROOT/"skills/module-design/SKILL.md").read_text(encoding="utf-8"),"S09未继承架构冻结规则")
# S04快速理解不允许只有笼统分类；必须列出具体决策项、产物及可判断的完成条件。
s04_overview=next(x["overview"] for x in catalog if x["id"]=="architecture-baseline")
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
require("关键端到端业务链路" in lookup["S04"]["prompt"] and "处理流程图" in lookup["S04"]["prompt"],"网站S04调用提示词没有落实两大核心")
renderer=(ROOT/"docs/app.js").read_text(encoding="utf-8")
for token in ("skill-topic-details","skill-topic-delivery","skill-topic-gate","skill-quick-facts"):
    require(token in renderer,"快速理解渲染逻辑缺失："+token)


# S05数据库总体必须真正完成三核心，S09不得重复构建全局核心表。
data_skill=(ROOT/"skills/data-architecture/SKILL.md").read_text(encoding="utf-8")
data_tpl=(ROOT/"skills/data-architecture/assets/data-architecture-template.md").read_text(encoding="utf-8")
data_gate=(ROOT/"skills/data-architecture/references/data-boundary-gate.md").read_text(encoding="utf-8")
for ref in ("references/three-core-contract.md","assets/data-architecture-template.md","references/data-boundary-gate.md"):
    require((ROOT/"skills/data-architecture"/ref).is_file(),"S05缺三核心配套文件："+ref)
for token in ("整体数据规则","关键数据业务流程","核心表","核心字段","ER图","S09"):
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
    require(token in lookup["S05"]["prompt"],"S05网站调用提示词缺少："+token)
module_skill=(ROOT/"skills/module-design/SKILL.md").read_text(encoding="utf-8")
require("S05核心数据骨架" in module_skill and "先返回S05" in module_skill,"S09未继承S05冻结")
require("S04/S05" in lookup["S09"]["prompt"],"S09必须继承总体架构和数据库冻结契约")
for token in ("pillarsTitle","pillarsDescription","data-count"):
    require(token in renderer,"三核心快速理解页面缺少："+token)

require("人工测试用例与结果.md" not in " ".join(lookup["S12"]["outputs"]),"S12原版不生成人工测试单")
require(lookup["S12"]["skillId"]=="implement-spec" and not lookup["S12"].get("invokes"),"S12须直接用Matt原版")
require("code-review" in lookup["S12"]["prompt"] and "TDD" in lookup["S12"]["prompt"],"实现缺原版内置能力")
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
require("Phase 1" in lookup["S14B"]["prompt"] and "diagnosing-bugs" in lookup["S14B"]["prompt"],"Bug诊断需调用原版六阶段")
require("初次部署配置.md" in " ".join(lookup["S06"]["inputs"]) and "8.1" in lookup["S06"]["prompt"],"S06应读原模板，确认后按8.1执行")
require(lookup["S07"]["skillId"]=="module-discovery" and "模块拆分" in lookup["S07"]["title"],"模块拆分主Skill或标题不一致")
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
for expected in ("模块验收与状态记录.md","人工测试用例与结果.md","初次部署配置-开发环境.md","项目基线.md","上线记录.md","code/","docs/"):
    require(expected in tree,"项目目录树遗漏："+expected)
for utility in workspace:
    require((ROOT/"skills"/utility["id"]/"SKILL.md").is_file(),utility["id"]+" 工具箱Skill丢失")
# 当前七步迭代和双关卡初次部署
require([s["id"] for s in data["phases"][2]["steps"]]==["S09","S10","S11","S12","S14H","S14B","S15"],"模块迭代步骤顺序错误")
for old in ("iteration-planning","dev-implement-spec","iteration-close"):
    require(not (ROOT/"skills"/old).exists(),"旧包装Skill仍存在："+old)
require((ROOT/"skills/manual-testing/SKILL.md").is_file(),"缺少人工测试Skill")
require("模块验收与状态记录.md" in " ".join(lookup["S14H"]["outputs"]),"缺人工签收")
require(".scratch/<模块>/<任务标识>/spec.md" in " ".join(lookup["S10"]["outputs"]),"新任务缺独立Spec")
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
for step_obj in steps:
    require(len(step_obj["title"])<=12,"执行步骤标题过长："+step_obj["id"])

# 来自用户的完整八节初次部署模板，在新项目初始化时可用，但不能替代真实部署包。
seed=(ROOT/"templates/project/code/deploy/single-node-docker/初次部署配置.md")
require(seed.is_file(),"缺少首次部署的项目初始化配置模板")
if seed.is_file():
    raw=seed.read_text(encoding="utf-8")
    for section in ("## 1. 部署服务清单","## 2. 开机自启动配置","## 3. 服务器连接配置","## 4. 端口配置","## 5. 数据库和中间件账号密码","## 6. FTP 文件存储配置","## 7. 初始化 SQL 配置","## 8. AI 执行要求","### 8.1 推荐提示词","### 8.2 AI 根据本文档执行部署步骤","### 8.3 验收标准及文档"):
        require(section in raw,"首次部署模板缺失："+section)



# 仓库全量洁净度与一致性检查：涵盖所有已跟踪文件，但不篡改Matt原版。
import re
import subprocess
from urllib.parse import unquote
tracked_output=subprocess.check_output(["git","ls-files","-z"],cwd=ROOT).decode("utf-8")
tracked=[Path(p) for p in tracked_output.split("\0") if p]
require(len(tracked)>120,"仓库已跟踪文件数量异常，可能漏扫文件")
for rel in tracked:
    actual=ROOT/rel
    require(actual.is_file(),"跟踪文件不存在："+str(rel))
    if actual.is_file() and (rel.suffix.lower() in {".md",".txt",".json",".js",".py",".css",".html",".yaml",".yml",".gitignore"} or rel.name in {".nojekyll",".gitignore"}):
        try: actual.read_text(encoding="utf-8")
        except UnicodeDecodeError: require(False,"文本非UTF-8："+str(rel))

known_main={x["id"] for x in catalog}
main_ids=[s["skillId"] for s in steps if s.get("skillId")]
require(set(main_ids)==known_main-{"code-review","grill-with-docs"},"导航主Skill与catalog清单不一致")
for stage_step in steps:
    id_=stage_step.get("skillId")
    if not id_: continue
    entry=next(x for x in catalog if x["id"]==id_)
    require(entry.get("inputs")==stage_step.get("inputs"),id_+" 输入在网站和目录元数据中不一致")
    require(entry.get("outputs")==stage_step.get("outputs"),id_+" 输出在网站和目录元数据中不一致")

obsolete=("input-readiness","human-acceptance","iteration-planning","iteration-close",
          "project-retrospective","dev-implement-spec","module-integration-acceptance")
official_dirs={x["id"] for x in catalog if x["type"]=="Matt原版"}
official_dirs.update(x["id"] for x in workspace)
official_dirs.update(("tdd","grilling","domain-modeling","codebase-design","wizard","writing-for-agents","pr","to-questionnaire"))
nonofficial_docs=[]
for rel in tracked:
    if rel.suffix.lower()!=".md": continue
    if rel.parts[0]=="skills" and len(rel.parts)>=2 and rel.parts[1] in official_dirs: continue
    nonofficial_docs.append(rel)
for rel in nonofficial_docs:
    body=(ROOT/rel).read_text(encoding="utf-8")
    for token in obsolete:
        require(token not in body,"仍含取消的Skill/阶段："+str(rel)+"："+token)
    require(not re.search(r"(?m)^#{1,3}\s+(?:20\d{2}[-年]|版本变更|更新记录|修订历史)",body),
            "出现历史追加章节："+str(rel))
    if rel.as_posix().startswith("docs/examples/") and rel.name.endswith(".md"):
        require(sum(1 for line in body.splitlines() if line.startswith("# "))==1,
                "示例文档必须只有一个主标题："+str(rel))
    for link in re.findall(r"\[[^\]\n]+\]\(([^)\n]+)\)",body):
        target=link.strip().split()[0]
        if target.startswith(("https://","http://","mailto:","app://","#")): continue
        target=unquote(target.split("#")[0].split("?")[0])
        if not target: continue
        require((ROOT/rel.parent/target).exists(),"Markdown相对链接失效："+str(rel)+" → "+target)
require((ROOT/"docs/输入输出契约与质量门禁.md").is_file(),"当前全流程契约缺失")
require(not (ROOT/"docs/输入输出契约与对抗性审查.md").exists(),"旧版契约仍存在")
for phase in ("input-readiness","human-acceptance","project-retrospective"):
    require(not (ROOT/"docs/examples/报价项目"/phase).exists(),"废弃Skill的示例目录仍存在："+phase)
for old in ROOT.glob("skills/*/templates/输出模板.md"):
    require(False,"重复输出壳未清理："+str(old.relative_to(ROOT)))
for ref in ("skills/system-acceptance/SKILL.md","skills/system-acceptance/references/execution-gate.md",
            "skills/release-readiness/SKILL.md","skills/release-readiness/references/execution-gate.md",
            "skills/release-preflight/SKILL.md","skills/release-preflight/references/execution-gate.md",
            "skills/release-delivery/SKILL.md","skills/release-delivery/references/execution-gate.md"):
    c=(ROOT/ref).read_text(encoding="utf-8")
    require("code/fld" not in c and "17个菜单" not in c,"通用验收/上线混入案例硬编码："+ref)

if errors:
    for m in errors: print("FAIL:",m)
    raise SystemExit(1)
print(f"PASS: {len(data['phases'])}阶段、{len(steps)}步骤、{len(catalog)}主Skill、{len(workspace)}通用Skill；原版实现/复盘与独立人测、首次部署完整。")
