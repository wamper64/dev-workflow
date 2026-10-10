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
inline = '<script type="application/json" id="workflow-data">' + serialized + '</script>\n<script>\n' + js + '\n</script>'
template = template.replace(script_tag, inline, 1)

if 'href="./styles.css"' in template or 'src="./app.js"' in template or 'fetch("./data/' in template:
    raise ValueError("构建结果仍依赖外部样式/脚本/流程数据")
if template.count('id="workflow-data"') != 1:
    raise ValueError("流程数据未正确内嵌")

output = DIST / "index.html"
output.write_text(template, encoding="utf-8")
print(f"已构建：{output}，大小 {len(template.encode('utf-8'))} 字节")
print(f"数据校验：{len(data['phases'])}阶段，{sum(len(p['steps']) for p in data['phases'])}步骤，{len(data['modules'])}模块")
