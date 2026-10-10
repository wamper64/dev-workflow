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
require(len(workflow["iterationFlow"]) == len(next(p for p in workflow["phases"] if p["id"] == "P02")["steps"]), "模块循环使用了旧的8步结构")
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
for mandatory in ("docs/input/需求资料/", "docs/input/工程资料/", "docs/input/环境资料/", "docs/input/对接资料/", "docs/output/01-项目基线/项目基线.md", "code/fld/", "code/guiwu_ruoyi/"):
    require(mandatory in inputs("S04"), "整体架构设计遗漏输入: " + mandatory)
for id in ("S05", "S09"):
    require("docs/output/01-项目基线/项目基线.md" in lookup[id]["inputs"], id + "遗漏项目基线")
require("迁移设计草案.md" in " ".join(lookup["S09"]["outputs"]), "模块详细设计SQL不是草案")
require("database/migrations/" in " ".join(lookup["S12"]["outputs"]), "TDD实现阶段缺正式版本化迁移")
require(all(x in lookup["S14B"]["review"] for x in ("S13", "S14", "S14H")), "Bug修复后缺代码审查/联调/人工复测")
require("Standards" in lookup["S13"]["title"], "Matt code-review未明确双轴")
require("S03Q" in lookup and "S08Q" in lookup, "Grill未前置")
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
