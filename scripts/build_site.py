#!/usr/bin/env python3
"""构建自包含 HTML：内联样式、脚本和流程数据，避免 Pages 多文件加载失败。"""

from html import escape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

template = (DOCS / "index.html").read_text(encoding="utf-8")
css = (DOCS / "styles.css").read_text(encoding="utf-8")
js = (DOCS / "app.js").read_text(encoding="utf-8")
data = json.loads((DOCS / "data" / "quotation.json").read_text(encoding="utf-8"))

assert len(data["phases"]) == 5, "阶段数检查失败"
assert all(len(s.get("skills", [])) == 1 for p in data["phases"][1:] for s in p["steps"]), "每步必须绑定一个Skill"
assert sum(len(p["steps"]) for p in data["phases"]) == 23, "步骤数检查失败"
assert len(data["modules"]) == 13, "业务模块数检查失败"

source = '''const res=await fetch("./data/quotation.json",{cache:"no-store"});
  if(!res.ok)throw Error("HTTP "+res.status);
  ui.data=await res.json();'''
target = '''ui.data=JSON.parse(document.getElementById("workflow-data").textContent);'''
if source not in js:
    raise ValueError("找不到原始远程数据加载代码，请检查 app.js")
js = js.replace(source, target, 1)

from zipfile import ZipFile, ZIP_DEFLATED

skills_catalog = json.loads((ROOT / "skills" / "catalog.json").read_text(encoding="utf-8"))
skill_payload = {"skills": []}
for item in skills_catalog:
    folder = ROOT / "skills" / item["id"]
    main = folder / "SKILL.md"
    if not main.is_file():
        raise ValueError("Skill文件不存在：" + str(main))
    record = dict(item)
    record["content"] = main.read_text(encoding="utf-8")
    example = folder / "examples" / "使用示例.md"
    template_file = folder / "templates" / "输出模板.md"
    record["example"] = example.read_text(encoding="utf-8") if example.is_file() else ""
    record["template"] = template_file.read_text(encoding="utf-8") if template_file.is_file() else ""
    skill_payload["skills"].append(record)
assert len(skill_payload["skills"]) == 21, "主Skill数量不正确"
assert len(list((ROOT / "skills").glob("*/SKILL.md"))) == 24, "全量Skill文件数量不正确"
for p in data["phases"][1:]:
    for s in p["steps"]:
        if s.get("skillId") not in {k["id"] for k in skill_payload["skills"]}:
            raise ValueError("工作步骤引用的Skill不存在：" + s["id"])

# 公开网站只打包通用模板与Skill，不包含真实客户PRD、代码或凭据。
archive = DIST / "skills-bundle.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as z:
    for root_name in ("skills", "templates/project"):
        for filepath in sorted((ROOT / root_name).rglob("*")):
            if filepath.is_file():
                z.write(filepath, filepath.relative_to(ROOT).as_posix())
    z.writestr("安装说明.md", "# 报价系统研发Skills包\\n\\n21个主Skill（Matt原版6个、基于Matt改造及自建15个），额外附带tdd、implement、writing-for-agents三个官方依赖，共24份SKILL.md。请按项目工作流选用。\\n\\n- Matt原版内容保留上游MIT许可，见 skills/LICENSE-Matt-Pocock.txt。\\n- 自建Skill的来源及差异参见 skills/REFERENCES.md。\\n- 将 templates/project/docs/ 放入业务项目根目录，真实PRD由项目方自行提供，不包含于此公开包。\\n")

stylesheet_tag = '<link rel="stylesheet" href="./styles.css">'
script_tag = '<script type="module" src="./app.js"></script>'
if template.count(stylesheet_tag) != 1 or template.count(script_tag) != 1:
    raise ValueError("HTML 中 CSS 或 JS 引用缺失/重复")

template = template.replace(stylesheet_tag, "<style>\n" + css + "\n</style>", 1)

# 页面首次输出就具备真实的静态内容；即使JS失败也能阅读第一阶段的说明。
first = data["phases"][0]
first_step = first["steps"][0]
def safe(v):
    return escape(str(v), quote=True)

stage_fallback = "".join(
    '<div class="stage-item"><span class="stage-index">'
    + str(i + 1).zfill(2) + '</span><span class="stage-body"><span class="stage-title">'
    + safe(p["title"]) + '</span></span></div>'
    for i, p in enumerate(data["phases"])
)
step_fallback = "".join(
    '<div class="step-item"><span class="step-index">'
    + str(i + 1) + '</span><span class="step-body"><strong>'
    + safe(s["title"]) + '</strong></span></div>'
    for i, s in enumerate(first["steps"])
)
detail_fallback = (
    "<h2>" + safe(first_step["title"]) + "</h2>"
    + '<p class="step-context">' + safe(first["title"]) + "</p>"
    + '<section class="detail-section"><h3>Skill</h3><p>'
    + safe("、".join(first_step["skills"])) + "</p></section>"
    + '<section class="detail-section"><h3>输入</h3><p>'
    + safe("；".join(first_step["inputs"])) + "</p></section>"
    + '<section class="detail-section"><h3>输出</h3><p>'
    + safe("；".join(first_step["outputs"])) + "</p></section>"
    + '<section class="detail-section"><h3>审核</h3><p>'
    + safe(first_step["review"]) + "</p></section>"
)
template = template.replace('id="stage-list" class="stage-list" aria-label="选择工作阶段"></nav>', 'id="stage-list" class="stage-list" aria-label="选择工作阶段">' + stage_fallback + '</nav>', 1)
template = template.replace('id="stage-intro"></div>', 'id="stage-intro"><h1>' + safe(first["title"]) + '</h1><p class="stage-desc">' + safe(first["description"]) + '</p></div>', 1)
template = template.replace('id="step-count"></span>', 'id="step-count">' + str(len(first["steps"])) + ' 项工作</span>', 1)
template = template.replace('id="step-list" class="step-list"></div>', 'id="step-list" class="step-list">' + step_fallback + '</div>', 1)
template = template.replace('id="step-detail"></div>', 'id="step-detail">' + detail_fallback + '</div>', 1)

# 防止 JSON 文本中出现 </script> 导致标签提前闭合。
serialized = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
skills_serialized = json.dumps(skill_payload, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
inline = '<script type="application/json" id="workflow-data">' + serialized + '</script>\n'
inline += '<script type="application/json" id="skill-data">' + skills_serialized + '</script>\n'
inline += '<script>\n' + js + '\n</script>'
template = template.replace(script_tag, inline, 1)

# 构建产物必须可执行，不能仅检验源码 app.js。上一版双重转义的
# \\n 会变成实际JS开头的非法字符；对最终 HTML 内联脚本语法复检。
import subprocess
import tempfile
with tempfile.TemporaryDirectory() as tmp:
    from html.parser import HTMLParser
    class InlineScripts(HTMLParser):
        def __init__(self):
            super().__init__()
            self.active = False
            self.javascript = []
        def handle_starttag(self, tag, attrs):
            if tag == "script":
                a = dict(attrs)
                self.active = a.get("type", "text/javascript") in ("text/javascript", "module")
        def handle_endtag(self, tag):
            if tag == "script":
                self.active = False
        def handle_data(self, data):
            if self.active:
                self.javascript.append(data)
    parser = InlineScripts()
    parser.feed(template)
    assert parser.javascript, "最终HTML中未发现可执行的内联JavaScript"
    js_output = Path(tmp) / "site-inline.js"
    js_output.write_text("\\n".join(parser.javascript), encoding="utf-8")
    result = subprocess.run(["node", "--check", str(js_output)], capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError("最终HTML脚本语法错误:\\n" + result.stderr)
    print("最终HTML内联脚本语法校验通过")


if 'href="./styles.css"' in template or 'src="./app.js"' in template or 'fetch("./data/' in template:
    raise ValueError("构建结果仍依赖外部样式/脚本/流程数据")
if template.count('id="workflow-data"') != 1:
    raise ValueError("流程数据未正确内嵌")

output = DIST / "index.html"
output.write_text(template, encoding="utf-8")
print(f"已构建：{output}，大小 {len(template.encode('utf-8'))} 字节")
print(f"数据校验：{len(data['phases'])}阶段，{sum(len(p['steps']) for p in data['phases'])}步骤，{len(data['modules'])}模块")
