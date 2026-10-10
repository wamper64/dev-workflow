#!/usr/bin/env python3
"""研发导航静态契约和反例检查；可作为构建前置门禁。"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
workflow = json.loads((ROOT / "docs/data/quotation.json").read_text(encoding="utf-8"))
catalog = json.loads((ROOT / "skills/catalog.json").read_text(encoding="utf-8"))
workspace = json.loads((ROOT / "skills/workspace.json").read_text(encoding="utf-8"))
steps = [s for phase in workflow["phases"] for s in phase["steps"]]
lookup = {s["id"]: s for s in steps}
errors = []

def require(ok, message):
    if not ok:
        errors.append(message)

def inputs(id):
    return "\n".join(lookup[id]["inputs"])

require(len(lookup) == len(steps), "步骤ID不唯一")
require(len(catalog) == 24 and len(workspace) == 6, "Skill/工具箱数量不匹配")
require(len(workflow["iterationFlow"]) == len(next(p for p in workflow["phases"] if p["id"] == "P02")["steps"]), "模块循环与当前P02真实步骤不一致")
for step in steps:
    if step["id"].startswith("S00"):
        continue
    require(step.get("skillId") in {x["id"] for x in catalog}, step["id"] + "主Skill无对应目录")
    require(step.get("skills") == [step.get("skillId")], step["id"] + "主Skill指向不一致")
    require(bool(step.get("prompt") and step.get("inputs") and step.get("outputs")), step["id"] + "缺执行提示词或输入输出")
    for v in step["inputs"] + step["outputs"]:
        require("D:/company/environment" not in v, step["id"] + "仍绑定指定Windows路径")
        require("doc/output/" not in v.replace("docs/output/", ""), step["id"] + "写错docs/output")
        require(v == v.strip(), step["id"] + "路径首尾有空格")
for p in workflow["phases"]:
    for v in p.get("artifacts", []):
        require("doc/output/" not in v.replace("docs/output/", ""), p["id"] + "阶段产物路径写错")
require("docs/input/" in inputs("S04") and ("递归" in inputs("S04") or "全部" in inputs("S04")), "整体架构必须递归读取docs/input全部类别")
for mandatory in ("docs/output/01-项目基线/项目基线.md", "code/fld/", "code/guiwu_ruoyi/"):
    require(mandatory in inputs("S04"), "整体架构设计遗漏输入: " + mandatory)
for required in ("需求资料", "工程资料", "环境资料", "对接资料"):
    require(required in lookup["S04"]["prompt"] or required in (ROOT/"skills/architecture-baseline/SKILL.md").read_text(encoding="utf-8"),"架构Skill未覆盖全部原始输入目录: "+required)
for id in ("S05", "S09"):
    require("docs/output/01-项目基线/项目基线.md" in lookup[id]["inputs"], id + "遗漏项目基线")
require("迁移设计草案.md" in " ".join(lookup["S09"]["outputs"]), "模块详细设计SQL不是草案")
require("database/migrations/" in " ".join(lookup["S12"]["outputs"]), "TDD实现阶段缺正式版本化迁移")
require("code-review" in lookup["S12"]["prompt"] and "TDD" in lookup["S12"]["prompt"], "implement-spec内应明确TDD和Matt双轴代码审查")
require("代码审查记录.md" in " ".join(lookup["S12"]["outputs"]), "实现阶段缺真实代码审查证据文件")
require("实现与自动验证记录.md" in " ".join(lookup["S12"]["outputs"]), "实现阶段缺自动验证证据文件")
require("人工测试用例与结果.md" in " ".join(lookup["S14H"]["outputs"]), "人工测试必须生成待执行与回填同一文件")
require("六阶段" in lookup["S14B"]["prompt"] and "人工" in lookup["S14B"]["prompt"], "Bug定位必须六阶段并人工复测")
require("docs/output/04-开发环境/部署步骤与执行记录.md" in lookup["S06"]["outputs"], "环境部署主输出缺失")
for id in ("S07", "S08", "S12"):
    require("docs/output/04-开发环境/部署步骤与执行记录.md" in " ".join(lookup[id]["inputs"]), id+"引用旧环境验收文件")
require("docs/output/06-模块迭代/<模块>/人工测试用例与结果.md" in " ".join(lookup["S16"]["inputs"]), "系统验收未读取真实人工测试结果")
for id in ("S04", "S09"):
    require("grill-with-docs" in lookup[id]["prompt"], id + "未在主Skill内部启动Grill")
    require((ROOT / "skills" / lookup[id]["skillId"] / "SKILL.md").read_text(encoding="utf-8").find("grill-with-docs") != -1, id + "Skill正文缺内部Grill")
for x in catalog + workspace:
    require(x["source"]["url"].startswith("https://github.com/"), x["id"] + "缺上游链接")
    require(bool(x.get("referenceLearnings")), x["id"] + "没有写参考的具体内容")
    if x in catalog:
        require(bool(x.get("adaptation")), x["id"] + "没有写采用/改造内容")
        require((ROOT / "skills" / x["id"] / "SKILL.md").is_file(), x["id"] + "缺Skill正文")
if errors:
    for message in errors:
        print("FAIL:", message)
    raise SystemExit(1)
print("PASS: %d步骤/%d主Skill/%d通用Skill。架构、SQL草案、Grill、HITL与Bug回环契约已验证。" % (len(steps), len(catalog), len(workspace)))
