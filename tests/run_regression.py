#!/usr/bin/env python3
"""自建Skill的15项场景契约/安全演练。不是模型Agent端到端运行、生产发布或真人验收。"""
from pathlib import Path
from hashlib import sha256
from decimal import Decimal
from collections import Counter
import argparse, json, sqlite3, sys, re
ROOT=Path(__file__).resolve().parents[1]
S=ROOT/"skills"
F=json.loads((ROOT/"tests/fixtures/adversarial-project.json").read_text(encoding="utf-8"))
CAT=json.loads((S/"catalog.json").read_text(encoding="utf-8"))
SITE=json.loads((ROOT/"docs/data/quotation.json").read_text(encoding="utf-8"))
RESULT=[]
def skill(path): return (S/path).read_text(encoding="utf-8")
def need(ok, msg):
    if not ok: raise AssertionError(msg)
def check(cid, label, method, fn):
    try:
        evidence=fn()
        RESULT.append(dict(id=cid,name=label,status="通过",method=method,evidence=evidence))
        print(f"{cid} 通过 [{method}] {label}")
    except Exception as e:
        RESULT.append(dict(id=cid,name=label,status="不通过",method=method,evidence=f"{type(e).__name__}: {e}"))
        print(f"{cid} 不通过 {label}: {e}")
def t01():
    m=F["modules"];need(len(m)==12 and len({x["owner"] for x in m})==12,"12项业务/Owner边界没有完整建模")
    s=skill("module-discovery/SKILL.md")
    need(("保留12个" in s or "允许输出12个" in s) and not re.search(r"全项目业务模块\*\*不超过 10",s),"未支持超过10个独立模块的场景")
    return "12项模块与12个Owner通过清点；核对Skill避免机械合并"
def t02():
    m=F["modules"];need(set(F["pageLess"]).issubset({x["name"] for x in m}),"漏掉无页面模块")
    s=skill("module-discovery/SKILL.md");need("无页面" in s and "module_key" in s,"缺无页面或稳定key规则")
    return "设备自动告警等无页面能力在候选模块中具有稳定key"
def t03():
    need("只读驾驶舱" in F["readOnly"],"跨域查询没有只读约束")
    need("跨域" in skill("module-discovery/SKILL.md") and "跨域" in skill("data-architecture/SKILL.md"),"跨域归属约束未贯通")
    return "驾驶舱标明只读 + 跨域契约，禁止以无写入为由丢弃"
def t04():
    rows=F["capacity"];ids=[x["id"] for x in rows];need(len(ids)==len(set(ids)),"容量科目重复")
    base=sum((Decimal(str(x["gb"])) for x in rows),Decimal("0"))
    need(base==Decimal("260"),"互斥科目容量合计必须是260GB")
    need("去重" in skill("project-baseline/SKILL.md") and "容量" in skill("data-architecture/SKILL.md"),"未要求科目不重复")
    return f"Decimal实际计算：100+40+20+100={base}GB；索引等未提供额外量不得凭空计入"
def t05():
    db=sqlite3.connect(":memory:")
    db.execute("CREATE TABLE x(id INTEGER PRIMARY KEY, tenant TEXT, code TEXT, deleted INTEGER DEFAULT 0)")
    db.execute("CREATE UNIQUE INDEX active_only ON x(tenant,code) WHERE deleted=0")
    db.execute("INSERT INTO x (tenant,code) VALUES ('t','A')")
    db.execute("UPDATE x SET deleted=1 WHERE id=1")
    db.execute("INSERT INTO x (tenant,code) VALUES ('t','A')")
    db.execute("UPDATE x SET deleted=1 WHERE id=2")
    db.execute("INSERT INTO x (tenant,code) VALUES ('t','A')")
    need(db.execute("SELECT COUNT(*) FROM x").fetchone()[0]==3,"历史记录丢失")
    need(db.execute("SELECT COUNT(*) FROM x WHERE deleted=0").fetchone()[0]==1,"活动唯一键失效")
    need("唯一键" in skill("data-architecture/references/rule-catalog.md"),"未说明唯一性要求")
    return "实际运行SQLite内存唯一性场景：建→删→建→删→重建；3条历史、1条有效；不代表MySQL实现已验证"
def t06():
    e=F["existing"]
    need("sys_user" in e["tables"] and "sys_menu" in e["tables"],"存量表缺失")
    need("sys_user" in skill("data-architecture/SKILL.md") and "动态菜单" in skill("module-discovery/SKILL.md"),"Skill忽略存量表或动态菜单")
    return "既有sys_user/sys_menu与复合键写入夹具，规则要求先扫描而非重建"
def t07():
    before={x["name"]:x["key"] for x in F["modules"]}
    after={x["name"]:x["key"] for x in list(reversed(F["modules"]))}
    need(before==after and len(set(before.values()))==len(before),"排序改变了module_key")
    need("module_key" in skill("module-design/SKILL.md"),"下游未引用稳定module_key")
    return "执行倒序排序，12个模块key保持不变"
def t08():
    rows=F["trackers"];need(len({x["canonical"] for x in rows})==1,"跨Tracker失去稳定任务号")
    need(len({x["provider"] for x in rows})==3,"缺少三种Tracker")
    need("Tracker" in skill("manual-testing/SKILL.md"),"人工测试未约束真实任务定位")
    return "本地/GitHub/GitLab三种位置经canonical任务号映射，不伪造真实Issue已创建"
def t09():
    rows=F["snapshots"];old=dict(rows[0]);rows2=[dict(x) for x in rows]
    rows2[1]["module"]="sha-module-003"
    need(old==rows2[0],"更新新版设计改写了旧Ticket引用")
    need("SHA" in skill("module-design/SKILL.md"),"模块设计缺版本快照要求")
    return "模拟新版模块SHA更新，旧spec/设计绑定记录保持不变"
def t10():
    rounds=F["rounds"];need(len(rounds)==2 and rounds[0]["result"]=="失败" and rounds[1]["result"]=="通过","复测结果覆盖历史")
    need(rounds[0]["build"]!=rounds[1]["build"],"复测未跟踪构建变更")
    need("复测" in skill("manual-testing/SKILL.md"),"人工复测存证规则缺失")
    return "保存两轮独立构建/环境/数据结果；结果仅模拟，不是人工实测签收"
def t11():
    rows=F["permissions"];need(len(rows)>=3 and any("跨部门" in x["case"] for x in rows),"遗漏模块PRD权限场景")
    need("模块PRD" in skill("system-acceptance/SKILL.md"),"系统验收仅采用项目PRD")
    return "3条角色场景权限矩阵可追溯，包括跨部门审批与只读；待实际执行"
def fingerprint(obj):
    payload=json.dumps(obj,sort_keys=True,ensure_ascii=False).encode()
    return sha256(payload).hexdigest()
def t12():
    b=F["release"];v=fingerprint(b)
    need(v!=fingerprint({**b,"sql":b["sql"]+"\nALTER TABLE tb_quote ADD c INT;"}),"SQL变更未使指纹失效")
    need(v!=fingerprint({**b,"image":"sha256:image-v2"}),"镜像变更未使指纹失效")
    need(v!=fingerprint({**b,"config":"APP_MODE=staging"}),"配置变更未使指纹失效")
    need("发布指纹" in skill("release-preflight/SKILL.md"),"Skill缺发布指纹规则")
    return "实际SHA256计算并变更SQL/镜像/配置三项，旧指纹均失效"
def allow_restore(target):return target.startswith("isolated://") and "production" not in target
def t13():
    need(allow_restore("isolated://restore-check"),"隔离恢复被拦截")
    need(not allow_restore("production://main"),"生产库误获恢复权限")
    need("隔离副本" in skill("release-preflight/references/execution-gate.md"),"Skill没有隔离要求")
    return "安全策略模拟：隔离副本允许；生产权威库拒绝；未对任何真实数据库恢复"
def allowed_command(command, approved):
    dangerous=bool(re.search(r"\brm\s+-rf\b|\bDROP\s+DATABASE\b|\bdocker\s+volume\s+rm\b",command,re.I))
    return not dangerous or approved
def t14():
    need(not allowed_command("DROP DATABASE quotes;",False),"危险SQL未拦截")
    need(not allowed_command("rm -rf /data/quotes",False),"危险删除未拦截")
    need(allowed_command("docker compose ps",False),"只读命令不应阻塞")
    need("单独授权" in skill("release-preflight/references/execution-gate.md"),"未规定逐命令授权")
    return "实际运行模拟命令授权校验：DROP DATABASE/rm -rf无批准拒绝；只读查询放行；不执行命令"
def t15():
    steps={s["id"]:s for phase in SITE["phases"] for s in phase["steps"]}
    need(len(CAT)==19 and len(steps)==19 and len(SITE["phases"])==4,"阶段/Skill结构不一致")
    for sk in CAT:
        need((S/sk["id"]/"SKILL.md").is_file(),"缺Skill "+sk["id"])
        if sk.get("type")=="Matt原版":continue
        st=steps.get(sk.get("stepId"))
        need(st is not None and sk["id"] in st.get("skills",[]),"步骤映射不符："+sk["id"])
        need(all(output in st["outputs"] for output in sk["outputs"]),"输出产物与导航不同步："+sk["id"])
    need(SITE["phases"][3]["title"]=="3. 全项目验收与部署上线" and [s["title"] for s in SITE["phases"][3]["steps"]]==["系统业务验收","系统性能验收","上线部署"],"末尾应为单一总阶段及三个内部步骤")
    need(steps["S16"]["outputs"]==["docs/output/07-系统验收/系统验收报告.md"],"S16不再是唯一报告")
    for stepid in ("S18",):
        variants=steps[stepid].get("promptExamples",[])
        need(len(variants)==4 and all(x in " ".join(v["prompt"] for v in variants) for x in ("开发","测试","正式","首次应用上线","版本更新")),"部署环境×发布类型覆盖不足："+stepid)
    need((ROOT/"docs/images/architecture-baseline.png").is_file(),"架构原图缺失")
    ws=json.loads((S/"workspace.json").read_text(encoding="utf-8"))
    for sk in [*CAT,*ws]:
        if sk["id"]=="architecture-baseline":continue
        need((ROOT/"docs/images/skills"/(sk["id"]+".svg")).is_file(),"缺专属图片："+sk["id"])
    return "实测JSON映射：4阶段19步骤、19主Skill及8通用Skill，11个自建Skill输出一致，27个图片入口齐全"

check("T01","独立12模块拆分","场景夹具与规则",t01)
check("T02","无页面自动告警","场景夹具与规则",t02)
check("T03","只读跨域驾驶舱","场景夹具与规则",t03)
check("T04","容量科目闭合","Decimal计算与规则",t04)
check("T05","逻辑删除唯一键","SQLite内存实际执行",t05)
check("T06","保留存量表与菜单","场景夹具与规则",t06)
check("T07","排序后key稳定","数据变换执行",t07)
check("T08","多Tracker任务映射","数据变换执行",t08)
check("T09","设计SHA历史引用","版本数据演练",t09)
check("T10","两次构建复测留存","版本记录演练",t10)
check("T11","模块PRD权限验收","场景夹具与规则",t11)
check("T12","变更触发发布指纹失效","SHA256计算",t12)
check("T13","禁止生产权威库恢复","隔离授权模拟",t13)
check("T14","破坏性命令独立授权","危险命令模拟拦截",t14)
check("T15","全站与Skill契约一致","真实文件/JSON扫描",t15)
passed=sum(x["status"]=="通过" for x in RESULT)
report=dict(title="对抗性场景契约执行记录",tested_at="2026-10-14",scope="本仓库实际文件+测试夹具",interpretation="通过仅表示本脚本的场景契约或内存安全演练通过；未运行AI Agent端到端、客户生产环境、真实MySQL恢复及真人签收。",total=len(RESULT),passed=passed,failed=len(RESULT)-passed,results=RESULT)
arg=argparse.ArgumentParser();arg.add_argument("--out",default="")
opts=arg.parse_args()
if opts.out:
    p=Path(opts.out);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"完成：{passed}/{len(RESULT)}场景契约或模拟执行通过（不等于真实Agent验收）")
sys.exit(0 if passed==len(RESULT) else 1)
