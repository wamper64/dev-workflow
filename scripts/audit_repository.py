#!/usr/bin/env python3
"""全仓静态文件审查：针对所有git跟踪文件；不以静态检查冒充模型或业务验收。"""
from pathlib import Path
from collections import Counter
import json, re, subprocess, sys
from xml.etree import ElementTree
ROOT=Path(__file__).resolve().parents[1]
errors=[];warnings=[]
def require(ok,msg):
    if not ok: errors.append(msg)
try:
    tracked=subprocess.check_output(["git","ls-files","-z"],cwd=ROOT).decode().strip("\0").split("\0")
except (OSError,subprocess.CalledProcessError):
    tracked=[str(p.relative_to(ROOT)) for p in ROOT.rglob("*") if p.is_file() and "dist" not in p.relative_to(ROOT).parts]
tracked=[p for p in tracked if p]
groups=Counter()
text_ext={".md",".json",".yaml",".yml",".py",".js",".cjs",".html",".css",".txt",".svg",".gitignore"}
for item in tracked:
    p=ROOT/item
    require(p.is_file(),"tracked文件不存在："+item)
    if not p.is_file():continue
    # .nojekyll 以空文件作为 GitHub Pages 配置标记，属于有效文件。
    if item!=".nojekyll":require(p.stat().st_size>0,"空文件："+item)
    groups[item.split("/")[0]]+=1
    if "__pycache__" in item or item.endswith(".pyc") or item.startswith("dist/"):
        errors.append("生成文件不应跟踪："+item)
    if p.suffix==".png":
        require(p.read_bytes().startswith(b"\x89PNG\r\n\x1a\n"),"PNG头损坏："+item)
    if p.suffix in text_ext or p.name in {".nojekyll",".gitignore"}:
        try:content=p.read_text(encoding="utf-8")
        except UnicodeError:
            errors.append("文本不是UTF-8："+item);continue
        if p.suffix==".json":
            try:json.loads(content)
            except json.JSONDecodeError as exc:errors.append("JSON错误："+item+" "+str(exc))
        if p.suffix==".svg":
            try:ElementTree.fromstring(content)
            except ElementTree.ParseError as exc:errors.append("SVG结构错误："+item+" "+str(exc))
            require("<script" not in content.lower() and "javascript:" not in content.lower(),"SVG包含脚本："+item)
# 仅对自建Skill核验实际相对链接；Matt原文有生成项目后才存在的目标，不改写官方原版。
catalog=json.loads((ROOT/"skills/catalog.json").read_text(encoding="utf-8"))
workspace=json.loads((ROOT/"skills/workspace.json").read_text(encoding="utf-8"))
website=json.loads((ROOT/"docs/data/quotation.json").read_text(encoding="utf-8"))
for sk in catalog:
    name=sk["id"];main=ROOT/"skills"/name/"SKILL.md"
    require(main.is_file(),"Skill丢失："+name)
    if sk["type"]=="Matt原版":continue
    txt=main.read_text(encoding="utf-8")
    for dest in re.findall(r"\]\(([^)]+)\)",txt):
        dest=dest.split("#",1)[0]
        if not dest or re.match(r"^(?:[a-z]+:|#|/)",dest,re.I):continue
        dest=dest.replace("%20"," ")
        require((main.parent/dest).exists(),name+" 相对链接失效："+dest)
steps={s["id"]:s for ph in website["phases"] for s in ph["steps"]}
for sk in catalog:
    if sk["type"]=="Matt原版":continue
    step=steps.get(sk.get("stepId"))
    require(step is not None,"自建Skill缺导航步骤："+sk["id"])
    if step:
        match=step.get("outputs")==sk.get("outputs")
        # release-preflight是S18上线部署内部前置Skill，产物是同一步骤正式输出的子集。
        if sk["id"]=="release-preflight":
            match=all(path in step.get("outputs",[]) for path in sk.get("outputs",[])) and "release-preflight" in step.get("skills",[])
        require(match,"产物路径不一致："+sk["id"])
require(len(catalog)==19 and len(workspace)==8,"导航Skill数量变化需联动修订")
require(len(list((ROOT/"skills").glob("*/SKILL.md")))==35,"完整Skill主文件非35份")
require(len(list((ROOT/"docs/images/skills").glob("*.svg")))==26,"缺26份专属SVG")
require((ROOT/"docs/images/architecture-baseline.png").is_file(),"用户指定架构原图缺失")
for skill in [*catalog,*workspace]:
    if skill["id"]!="architecture-baseline":
        require((ROOT/"docs/images/skills"/(skill["id"]+".svg")).is_file(),"Skill图片缺失："+skill["id"])
require("不超过 10 个" not in (ROOT/"skills/module-discovery/SKILL.md").read_text(encoding="utf-8"),"模块数量仍写强制上限")
# 模块设计示例不得回退到曾经的8章草稿或旧Tracker路径。
sample=(ROOT/"docs/examples/报价项目/module-design/报价需求核对模块设计示例.md").read_text(encoding="utf-8")
titles=re.findall(r"^## (\d+)\. (.+)$",sample,re.M)
require(len(titles)==7 and [int(n) for n,_ in titles]==list(range(1,8)),"模块设计示例未按当前七章Skill模板重构")
require("本轮范围与依赖检查.md" not in sample and "迁移设计草案.md" not in sample,"模块设计示例仍交付废弃的独立文件")
require(".scratch/<module_key>/模块详细设计.md" in sample,"模块设计示例未绑定稳定模块身份")
data=website["phases"]
by_id={step["id"]:step for phase in data for step in phase["steps"]}
for step_id in ["S10","S11"]:
    require(any("<feature-slug>" in out for out in by_id[step_id]["outputs"]),"Matt本地Tracker路径不能混用module_key："+step_id)

for filename in ["docs/研发流程输入输出与质量门禁.md","docs/data/project-directory-tree.txt"]:
    txt=(ROOT/filename).read_text(encoding="utf-8")
    require("项目基线前置约束确认表.md" not in txt,"旧项目基线额外文件残留："+filename)
for item in catalog:
    for key in ["outputSampleFile","consultationFile"]:
        dest=item.get(key)
        if dest:require((ROOT/dest).is_file(),"Skill示例路径不存在："+dest)
print("全仓静态检查："+str(len(tracked))+"个版本管理文件；分组="+str(dict(groups)))
for warning in warnings:print("WARN:",warning)
for error in errors:print("FAIL:",error)
if errors:sys.exit(1)
print("通过：文件编码、JSON/SVG、主文件与引用、示例、跨阶段输出、图示覆盖和过期术语检查；不代表业务真实验收。")
