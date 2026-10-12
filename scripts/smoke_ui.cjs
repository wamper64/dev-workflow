#!/usr/bin/env node
/* 对最终发布HTML做真实DOM点击回归；不依赖后端或浏览器公网。 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {JSDOM, VirtualConsole} = require("/tmp/dev-workflow-ui-test/node_modules/jsdom");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"dist","index.html"),"utf8");
const errors=[];
const virtualConsole=new VirtualConsole();
virtualConsole.on("jsdomError",e=>errors.push(e.message));
const dom=new JSDOM(html,{
 url:"https://wamper64.github.io/dev-workflow/",
 runScripts:"dangerously",
 pretendToBeVisual:true,
 virtualConsole,
 beforeParse(window){
   if(!window.HTMLDialogElement.prototype.showModal)
     window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","")};
   if(!window.HTMLDialogElement.prototype.close)
     window.HTMLDialogElement.prototype.close=function(){this.removeAttribute("open")};
 }
});
async function main(){
 const doc=dom.window.document;
 await new Promise(r=>setTimeout(r,70));
 const click=selector=>{
   const element=doc.querySelector(selector);
   assert.ok(element,"找不到按钮："+selector);
   element.click();
   return element;
 };
 assert.equal(doc.querySelectorAll("#stage-list button[data-phase]").length,5,"四个工作阶段加通用工具应可点击");
 assert.match(doc.querySelector("#project-stats").textContent,/4 个阶段.*7 个通用Skill/);
 assert.ok(!doc.getElementById("project-stats").textContent.includes("正在载入"),"JS未完成初始化");
 click('[data-phase="P01"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,7,"准备设计步骤错误");
 click('[data-step="S01"]');
 assert.equal(doc.querySelectorAll("#step-detail [data-skill]").length,0,"输入检查只用提示词");
 assert.match(doc.querySelector("#step-detail .prompt-text").textContent,/递归阅读 docs\/input\//);
 // 设计阶段六个Skill的快速理解必须同时显示可视流程与具体缺口清单。
 const designs=[
   ["S02","setup-matt-pocock-skills",5,5],
   ["S03","project-baseline",6,8],
   ["S04","architecture-baseline",6,9],
   ["S05","data-architecture",6,8],
   ["S06","development-environment",6,5],
   ["S07","module-discovery",6,7]
 ];
 for(const [stepId,skillId,minimumRoute,minimumCoverage] of designs){
   click('[data-step="'+stepId+'"]');
   click('[data-skill="'+skillId+'"]');
   assert.ok(doc.querySelectorAll(".quick-route-node").length>=minimumRoute,skillId+" 缺执行流程图");
   assert.ok(doc.querySelectorAll(".quick-coverage-row").length>=minimumCoverage,skillId+" 缺覆盖速查项");
   assert.match(doc.getElementById("skill-dialog-content").textContent,/审核关口|未通过/,"快速理解缺少失败退回路径");
   assert.match(doc.querySelector(".quick-coverage").textContent,/未完成|待确认|缺少|不适用/,"覆盖速查应说明缺项的处理方式");
   click("[data-skill-close]");
 }
 click('[data-step="S02"]');
 assert.match(doc.querySelector("#step-detail").textContent,/code\//);
 click('[data-step="S03"]');
 assert.match(doc.getElementById("step-detail").textContent,/项目基线前置约束确认表/);
 click('[data-skill="project-baseline"]');
 assert.equal(doc.getElementById("skill-dialog").open,true,"Skill预览未打开");
 assert.equal(doc.querySelectorAll(".skill-topic-card").length,8,"工程基线8类量化内容未展示");
 assert.match(doc.querySelector(".skill-overview").textContent,/16GiB|16 GiB/);
 assert.match(doc.querySelector(".skill-overview").textContent,/保留|5年/);
 assert.match(doc.querySelector(".skill-summary").textContent,/只定义工程约束/);
 click('[data-skill-tab="result"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/报价系统项目工程基线/);
 assert.ok(doc.querySelectorAll(".sample-table").length>=6,"成品示例应显示可阅读表格");
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/MySQL 8\.0/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/500GB|500 GB/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/P95\s*≤\s*2\.0秒/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/保留|保存/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/整机资源|资源余量|资源上限/);
 click('[data-sample="consultation"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/每轮优先询问最多三组|三组高影响/);
 click('[data-sample="final"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/确认版本|版本.*依据.*追溯/);
 click('[data-skill-tab="files"]');
 assert.ok(doc.querySelectorAll("[data-skill-file]").length>=8,"技能目录文件未全部呈现");
 assert.ok(![...doc.querySelectorAll("[data-skill-file]")].some(x=>/examples/.test(x.dataset.skillFile)),"可安装Skill目录不得包含项目示例");
 click('[data-skill-file="references/checklist.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/项目基线生成与放行检查/);
 click('[data-skill-file="assets/preconfirmation-template.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/只需用户裁定|自动预填/);
 click('[data-skill-file="scripts/check_inputs.py"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/argparse/);
 click("[data-skill-close]");
 click('[data-phase="P02"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,7,"模块开发步骤错误");
 assert.match(doc.querySelector("#phase-route").textContent,/Grill/,"模块流程速览必须显示Grill");
 assert.match(doc.querySelector("#phase-route").textContent,/人工测试/,"模块流程速览必须显示人工测试");
 click('[data-phase="P01"]');
 click('[data-step="S04"]');
 click('[data-skill="architecture-baseline"]');
 assert.ok(doc.querySelectorAll(".skill-topic-card").length>=5,"整体架构须展示组件与交互的多个内容板块，而非空壳");
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/运行单元/);
 click('[data-skill-tab="files"]');
 click('[data-skill-file="references/architecture-gate.md"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/整体架构骨架的审核门禁/);
 click('[data-skill-tab="source"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/实际采用与定制化改造/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/architecture spine|组件清单|交互/);
 click("[data-skill-close]");
 click('[data-step="S06"]');
 assert.match(doc.querySelector("#step-detail").textContent,/初次部署配置/);
 assert.equal(doc.querySelectorAll("[data-dev-field]").length,0,"旧环境信息强制填写表应移除");
 assert.match(doc.querySelector("#step-detail .prompt-text").textContent,/8\.1|初次部署配置-<环境名称>/);
 click('[data-skill="development-environment"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/环境|配置|确认/);
 click("[data-skill-close]");
 click('[data-step="S05"]');
 click('[data-skill="data-architecture"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/数据域/);
 click("[data-skill-close]");
 click('[data-step="S07"]');
 assert.match(doc.querySelector("#step-detail").textContent,/Matt Tickets/);
 click('[data-skill="module-discovery"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/Blocking edges|纵向|Tracer bullet/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/模块级/);
 click('[data-skill-tab="files"]');
 click('[data-skill-file="SKILL.md"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/S11|to-tickets/);
 click("[data-skill-close]");
 click('[data-phase="P02"]');
 click('[data-step="S09"]');
 click('[data-skill="module-design"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/字段|状态机/);
 click("[data-skill-close]");
  click('[data-step="S12"]');
 assert.match(doc.querySelector("#step-detail").textContent,/TDD/);
 assert.doesNotMatch(doc.querySelector("#step-detail").textContent,/人工测试用例与结果\.md/);
 assert.match(doc.querySelector("#step-detail").textContent,/code-review/);
 click('[data-skill="implement-spec"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/TDD|ticket|Ticket|集成/);
 click("[data-skill-close]");
 click('[data-step="S14H"]');
 assert.match(doc.querySelector("#step-detail").textContent,/人工|签收/);
 assert.match(doc.querySelector("#step-detail").textContent,/人工测试用例与结果\.md/);
 assert.ok(doc.querySelector('#step-detail [data-skill="manual-testing"]'),"人工测试应为独立Skill");
 assert.ok(doc.querySelector('#step-detail [data-copy-prompt]'),"人工测试应有生成用例的执行提示词");
 click('[data-skill="manual-testing"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/人工|覆盖|签收/);
 click('[data-skill-tab="files"]');
 click('[data-skill-file="references/manual-coverage.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/覆盖|证据/);
 click("[data-skill-close]");
 click('[data-step="S14B"]');
 click('[data-skill="diagnosing-bugs"]');
 assert.equal(doc.querySelectorAll(".skill-topic-card").length,6,"官方diagnosing-bugs必须六个阶段");
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/Phase 1/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/Phase 6/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/原始症状|红灯/);
 click("[data-skill-close]");
 click('[data-step="S15"]');
 assert.match(doc.querySelector("#step-detail").textContent,/retro/);
 assert.ok(doc.querySelector('#step-detail [data-skill="retro"]'),"每轮复盘要有可点击Matt原版Skill");
 click('[data-skill="retro"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/AI|编码|复盘/);
 click("[data-skill-close]");
  click('[data-phase="P01"]');
 click('[data-step="S04"]');
 assert.match(doc.querySelector("#step-detail").textContent,/grill-with-docs/,"整体架构内必须包含Grill");
 click('[data-phase="P02"]');
 click('[data-step="S09"]');
 assert.match(doc.querySelector("#step-detail").textContent,/grill-with-docs/,"模块详细设计内必须包含Grill");
 click('[data-phase="P01"]');
 click('[data-phase="PTOOLS"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,7,"通用Skill应展示7个");
 assert.match(doc.querySelector("#stage-intro").textContent,/通用 Skills/);
 assert.match(doc.querySelector("#step-heading-title").textContent,/通用 Skill/);
 click('[data-step="T_handoff"]');
 assert.match(doc.querySelector("#step-detail").textContent,/跨阶段通用工具/);
 assert.match(doc.querySelector("#step-detail").textContent,/跨Harness|协作者|交接/);
 assert.match(doc.querySelector("#step-detail .prompt-text").textContent,/\/handoff/);
 click('[data-skill="handoff"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/跨工具|跨目录|交接/);
 click('[data-skill-tab="files"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/temporary directory/);
 click("[data-skill-close]");
 click('[data-step="T_research"]');
 assert.match(doc.querySelector("#step-detail").textContent,/一手来源|原始资料/);
 assert.equal(dom.window.location.hash,"#phase=PTOOLS&step=T_research");
 click('[data-step="T_wizard"]');
 assert.match(doc.querySelector("#step-detail").textContent,/人工|配置/);
 click('[data-step="T_pr"]');
 assert.match(doc.querySelector("#step-detail").textContent,/PR|合并风险/);
 click('[data-skill="pr"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/证据|合并风险|PR/);
 click("[data-skill-close]");
 click('[data-step="T_to-questionnaire"]');
 assert.match(doc.querySelector("#step-detail").textContent,/填写|问卷/);
 assert.equal(doc.querySelectorAll('[data-step="T_grill-me"]').length,0,"不应重复展示Grill入口");
 click("#tree-open");
 assert.equal(doc.getElementById("tree-dialog").open,true,"目录树未打开");
 assert.match(doc.getElementById("tree-content").textContent,/项目根目录/);
 assert.match(doc.getElementById("tree-content").textContent,/模块验收与状态记录.md/);
 assert.match(doc.getElementById("tree-content").textContent,/初次部署配置-开发环境.md/);
 click("[data-tree-close]");
 assert.equal(doc.getElementById("tree-dialog").open,false,"目录树未关闭");
  click('[data-phase="P01"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,7,"退出工具箱后应恢复主项目步骤");
  click('[data-phase="P00"]');
 assert.ok(!doc.querySelector("[data-copy-prompt]"),"准备工作不应出现执行提示词");
 assert.ok(fs.statSync(path.join(root,"dist","skills-bundle.zip")).size>15000,"ZIP不存在或过小");
 const all=fs.readFileSync(path.join(root,"scripts","build_site.py"),"utf8");
 assert.match(all,/skills-bundle\.zip|ZipFile/,"必须生成实际Skills压缩包");
 assert.equal(errors.length,0,"浏览器脚本异常："+errors.join("\n"));
 console.log("交互回归通过：标准项目导航、输入提示词、外置案例、原版开发与独立人工测试、人工测试独立Skill、Bug诊断、工具箱与29份Skill ZIP");
 dom.window.close();
}
main().catch(err=>{console.error(err);process.exitCode=1;dom.window.close()});
