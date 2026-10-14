#!/usr/bin/env python3
"""构建可脱网查看的单文件研发导航与全目录Skills包；对最终产物执行校验。"""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from zipfile import ZipFile, ZIP_DEFLATED
import json
import base64
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

template = (DOCS / "index.html").read_text(encoding="utf-8")
css = (DOCS / "styles.css").read_text(encoding="utf-8")
javascript = (DOCS / "app.js").read_text(encoding="utf-8")
data = json.loads((DOCS / "data/quotation.json").read_text(encoding="utf-8"))
catalog = json.loads((ROOT / "skills/catalog.json").read_text(encoding="utf-8"))
workspace = json.loads((ROOT / "skills/workspace.json").read_text(encoding="utf-8"))

subprocess.run(["python3", str(ROOT / "scripts" / "audit_contracts.py")], check=True)
# 每次发布都重新运行15项场景校验，不使用手写的“15/15通过”常量。
regression_path = DIST / "regression.json"
subprocess.run(["python3", str(ROOT/"tests/run_regression.py"), "--out", str(regression_path)], check=True)
regression = json.loads(regression_path.read_text(encoding="utf-8"))
table_rows = "".join(
    "<tr><td>"+escape(row["id"])+"</td><td>"+escape(row["name"])+"</td><td>"+escape(row["method"])+"</td><td>"+escape(row["status"])+"</td><td>"+escape(row["evidence"])+"</td></tr>"
    for row in regression["results"]
)
regression_html = (
    "<!doctype html><html lang='zh-CN'><meta charset='utf-8'>"
    "<meta name='viewport' content='width=device-width, initial-scale=1'>"
    "<title>技能对抗回归</title>"
    "<style>body{font:15px/1.8 system-ui,Microsoft YaHei,sans-serif;max-width:1250px;margin:35px auto;padding:0 22px;color:#17233c}"
    "a{color:#2563eb}table{width:100%;border-collapse:collapse}td,th{padding:12px;border:1px solid #dce3ef;text-align:left}"
    "th{background:#f0f5ff}tr:nth-child(even){background:#f9fbff}aside{background:#fff8e6;padding:14px;border-radius:12px}</style>"
    "<p><a href='./index.html'>← 返回研发导航</a></p><h1>15 项对抗性场景回归</h1>"
    "<p>本次执行通过："+str(regression["passed"])+"/"+str(regression["total"])+"</p>"
    "<aside>"+escape(regression["interpretation"])+"</aside>"
    "<table><thead><tr><th>编号</th><th>场景</th><th>类型</th><th>结果</th><th>实际证据</th></tr></thead>"
    "<tbody>"+table_rows+"</tbody></table></html>"
)
(DIST/"regression.html").write_text(regression_html,encoding="utf-8")


assert len(data["phases"]) == 4
assert sum(len(p["steps"]) for p in data["phases"]) == len({s["id"] for p in data["phases"] for s in p["steps"]})
assert len(data["phases"][1]["steps"]) == 7
assert len(data["phases"][2]["steps"]) == 7
assert isinstance(data["modules"], list) and len(data["modules"]) == 0
assert len(catalog) == 19
assert len({x["id"] for x in catalog}) == 19
known = {x["id"] for x in catalog}
for p in data["phases"][1:]:
    for step in p["steps"]:
        if step.get("manual"):
            assert step.get("skills") == [] and not step.get("skillId"), step["id"]
            continue
        assert step.get("skillId") in known, step["id"]
        assert step.get("skills") == (["release-preflight","release-delivery"] if step["id"]=="S18" else [step["skillId"]]), step["id"]

payload = {"skills": [], "examples": {}}
project_tree = (DOCS / "data/project-directory-tree.txt").read_text(encoding="utf-8")
assert "模块验收与状态记录.md" in project_tree and "人工测试用例与结果.md" in project_tree
for skill in catalog:
    folder = ROOT / "skills" / skill["id"]
    contents = {}
    for file in sorted(folder.rglob("*")):
        if file.is_file():
            relative = file.relative_to(folder).as_posix()
            contents[relative] = file.read_text(encoding="utf-8")
    assert "SKILL.md" in contents, skill["id"]
    record = dict(skill)
    record["files"] = contents
    payload["skills"].append(record)

custom_count = 0
for s in payload["skills"]:
    if s["type"] == "Matt原版":
        continue
    custom_count += 1
    main = s["files"]["SKILL.md"]
    assert "类型：" not in main and "参考与差异" not in main and "GitHub 源文件" not in main, s["id"]
    if s["id"] == "project-baseline":
        for required in (
            "assets/baseline-template.md", "references/checklist.md",
            "references/consistency.md", "references/editorial-standard.md",
            "scripts/check_inputs.py", "templates/澄清矩阵.md",
            "references/constraint-discovery.md", "references/applicability.md",
            "assets/preconfirmation-template.md",
        ):
            assert required in s["files"], required
assert custom_count == 11
assert len(list((ROOT / "skills").glob("*/SKILL.md"))) == 35
assert len(workspace) == 8
assert not any((ROOT / "skills" / old).exists() for old in ("input-readiness", "human-acceptance")), "旧的步骤型Skill应移除"
assert all(x["source"]["url"].startswith("https://github.com/mattpocock/skills/") for x in workspace)
assert set(x["id"] for x in workspace).isdisjoint(known)
assert set(x["id"] for x in workspace) == set(data["workspaceSkills"])

# 工具箱的官方原版同样加载完整目录，不要求绑定固定研发步骤。
for utility in workspace:
    folder = ROOT / "skills" / utility["id"]
    files = {}
    for file in sorted(folder.rglob("*")):
        if file.is_file():
            files[file.relative_to(folder).as_posix()] = file.read_text(encoding="utf-8")
    assert "SKILL.md" in files
    payload["skills"].append({**utility, "category": "workspace", "files": files})

# 单独生成的Skill流程图作为补充图片，不修改Matt原版或用户指定的架构PNG。
# 统一以内嵌data URI构建，保证Github Pages与离线单文件内容一致。
for record in payload["skills"]:
    ident = record["id"]
    picture = DOCS / "images" / "skills" / f"{ident}.svg"
    if ident == "architecture-baseline":
        continue  # 保留已确认的原始PNG，不使用重绘图覆盖
    assert picture.is_file(), f"缺少Skill执行图：{ident}"
    raw = picture.read_bytes()
    assert b"<svg" in raw and b"</svg>" in raw and b"<script" not in raw.lower(), f"SVG不安全：{ident}"
    record["illustration"] = {
        "src": "data:image/svg+xml;base64," + base64.b64encode(raw).decode("ascii"),
        "alt": f"{ident} 的步骤、输入与审核关系图"
    }

# 将用户指定的原始图片按二进制嵌入单文件HTML，在线与离线一致。
for record in payload["skills"]:
    visual = record.get("overview", {}).get("visual")
    if visual:
        src = visual["src"]
        assert src.startswith("./images/"), src
        asset = DOCS / src[2:]
        assert asset.is_file(), f"Skill图片缺失：{src}"
        ext = asset.suffix.lower()
        assert ext in (".png", ".svg"), f"图片类型不受支持：{src}"
        contents = asset.read_bytes()
        if ext == ".png":
            assert contents[:4] == bytes([137, 80, 78, 71]), "PNG文件签名不正确"
            mime = "image/png"
        else:
            assert b"<svg" in contents and b"</svg>" in contents and b"<script" not in contents.lower()
            mime = "image/svg+xml"
        visual["src"] = f"data:{mime};base64," + base64.b64encode(contents).decode("ascii")

# 项目案例仅供网站预览，绝不能写入skills目录或安装ZIP。
for record in catalog:
    for key in ("outputSampleFile", "consultationFile"):
        relative = record.get(key)
        if not relative:
            continue
        assert relative.startswith("docs/examples/报价项目/"), relative
        file = ROOT / relative
        assert file.is_file(), relative
        payload["examples"][relative] = file.read_text(encoding="utf-8")
assert not any((ROOT / "skills").glob("*/examples")), "示例目录必须与安装Skill分离"

# 交付检查覆盖全部技能与官方依赖。
for needed in ("grill-with-docs", "grilling", "domain-modeling", "handoff",
               "diagnosing-bugs", "implement-spec", "research", "wizard",
               "grill-me", "improve-codebase-architecture", "triage",
               "prototype", "implement", "wayfinder", "codebase-design"):
    assert (ROOT / "skills" / needed / "SKILL.md").is_file(), needed


archive = DIST / "skills-bundle.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as z:
    for folder in (ROOT / "skills", ROOT / "templates" / "project"):
        for f in sorted(folder.rglob("*")):
            if not f.is_file():
                continue
            # 调研信息只在网站侧呈现，安装包里不出现来源/类型目录元数据
            if f in (ROOT / "skills/catalog.json", ROOT / "skills/workspace.json", ROOT / "skills/REFERENCES.md"):
                continue
            z.write(f, f.relative_to(ROOT).as_posix())
    z.writestr("安装说明.md",
        "# 标准项目研发 Skills\n\n"
        "包含19个主Skill、8个通用入口与8个其它内置/执行依赖（共35份SKILL.md），并覆盖Grill、人工测试与Bug闭环。\n\n"
        "请将 skills/ 目录用于研发Agent工作区；"
        "把 templates/project/docs/ 及 templates/project/code/ 的初始化资料复制到真实项目，"
        "实际PRD和已有前后端源码由项目方提供，不包含在下载包中。\n"
        "如部署自有 Skill 运行环境，应按平台要求安置技能目录。"
        "Matt 官方原版所需的版权和许可说明见 skills/LICENSE-Matt-Pocock.txt。\n")
with ZipFile(archive) as z:
    names = z.namelist()
    assert len([n for n in names if n.endswith("/SKILL.md")]) == 35
    assert not any(n.endswith(("REFERENCES.md", "catalog.json", "workspace.json")) for n in names)
    assert "skills/project-baseline/scripts/check_inputs.py" in names
    assert "skills/setup-matt-pocock-skills/issue-tracker-local.md" in names
    assert "skills/project-baseline/references/checklist.md" in names
    assert "skills/project-baseline/assets/preconfirmation-template.md" in names
    assert "skills/project-baseline/references/constraint-discovery.md" in names
    assert "skills/project-baseline/references/applicability.md" in names
    assert "skills/manual-testing/SKILL.md" in names
    assert "skills/manual-testing/assets/manual-test-template.md" in names
    assert "templates/project/code/deploy/single-node-docker/初次部署配置.md" in names, "首次部署原始模板未进入安装包"
    assert all("skills/"+s+"/SKILL.md" in names for s in ("grill-me","improve-codebase-architecture","triage","prototype","implement","wayfinder","codebase-design"))
    assert "skills/pr/SKILL.md" in names and "skills/to-questionnaire/SKILL.md" in names
    assert not any(n.startswith(("skills/project-retrospective/","skills/iteration-planning/","skills/dev-implement-spec/","skills/iteration-close/")) for n in names)
    assert not any("/examples/" in n for n in names), "Skill ZIP不应包含项目示例"
    assert not any(n.startswith(("skills/input-readiness/", "skills/human-acceptance/")) for n in names), "已取消的步骤Skill不应包含在ZIP"

old = '''const res=await fetch("./data/quotation.json",{cache:"no-store"});
  if(!res.ok)throw Error("HTTP "+res.status);
  ui.data=await res.json();'''
new = '''ui.data=JSON.parse(document.getElementById("workflow-data").textContent);'''
assert old in javascript, "找不到数据加载代码"
javascript = javascript.replace(old, new, 1)

style_ref = '<link rel="stylesheet" href="./styles.css">'
script_ref = '<script type="module" src="./app.js"></script>'
assert template.count(style_ref) == 1
assert template.count(script_ref) == 1
template = template.replace(style_ref, "<style>\n" + css + "\n</style>", 1)

first = data["phases"][0]
first_step = first["steps"][0]
def safe(s):
    return escape(str(s), quote=True)

stages = "".join(
    '<div class="stage-item"><span class="stage-index">'
    + str(i).zfill(2) + '</span><span class="stage-body"><span class="stage-title">'
    + safe(p["title"]) + '</span></span></div>'
    for i,p in enumerate(data["phases"])
)
steps = "".join(
    '<div class="step-item"><span class="step-index">'
    + str(i+1) + '</span><span class="step-body"><strong>'
    + safe(step["title"]) + '</strong></span></div>'
    for i,step in enumerate(first["steps"])
)
detail = (
    "<h2>" + safe(first_step["title"]) + "</h2>"
    + '<p class="step-context">' + safe(first["title"]) + '</p>'
    + '<section class="detail-section"><h3>输入</h3><p>'
    + safe("；".join(first_step["inputs"])) + '</p></section>'
    + '<section class="detail-section"><h3>输出</h3><p>'
    + safe("；".join(first_step["outputs"])) + '</p></section>'
)
template = template.replace('id="stage-list" class="stage-list" aria-label="选择工作阶段"></nav>',
                            'id="stage-list" class="stage-list" aria-label="选择工作阶段">' + stages + '</nav>', 1)
template = template.replace('id="stage-intro"></div>',
                            'id="stage-intro"><h1>' + safe(first["title"]) + '</h1><p class="stage-desc">' + safe(first["description"]) + '</p></div>', 1)
template = template.replace('id="step-count"></span>', 'id="step-count">' + str(len(first["steps"])) + ' 项工作</span>', 1)
template = template.replace('id="step-list" class="step-list"></div>', 'id="step-list" class="step-list">' + steps + '</div>', 1)
template = template.replace('id="step-detail"></div>', 'id="step-detail">' + detail + '</div>', 1)

workflow_json = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
skills_json = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
inline = '\n'.join((
    '<script type="application/json" id="workflow-data">' + workflow_json + '</script>',
    '<script type="application/json" id="skill-data">' + skills_json + '</script>',
    '<script type="application/json" id="project-tree-data">' + json.dumps(project_tree, ensure_ascii=False).replace("<", "\\u003c") + '</script>',
    '<script>',
    javascript,
    '</script>',
))
template = template.replace(script_ref, inline, 1)
assert 'href="./styles.css"' not in template
assert 'src="./app.js"' not in template
assert 'fetch("./data/' not in template

class ScriptCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.is_js = False
        self.script_chunks = []
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            attrs = dict(attrs)
            self.is_js = attrs.get("type", "text/javascript") in ("text/javascript", "module")
    def handle_data(self, data):
        if self.is_js:
            self.script_chunks.append(data)
    def handle_endtag(self, tag):
        if tag == "script":
            self.is_js = False

parser = ScriptCollector()
parser.feed(template)
assert parser.script_chunks, "页面中没有可执行脚本"
with tempfile.TemporaryDirectory() as tmp:
    script = Path(tmp) / "inline.js"
    script.write_text("\n".join(parser.script_chunks), encoding="utf-8")
    result = subprocess.run(["node", "--check", str(script)], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError("内联JS语法错误:\n" + result.stderr)

html_path = DIST / "index.html"
html_path.write_text(template, encoding="utf-8")
print("内联JS校验通过")
print(f"构建成功：{html_path}（{len(template.encode('utf-8'))}字节）")
print(f"完整包：{archive}（{len(names)}个文件，35个Skill）")
