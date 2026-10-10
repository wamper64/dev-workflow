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
 assert.equal(doc.querySelectorAll("#stage-list button[data-phase]").length,6,"工作阶段与通用Skill入口必须可点击");
 assert.match(doc.querySelector("#project-stats").textContent,/5 个阶段.*6 个通用Skill/);
 assert.ok(!doc.getElementById("project-stats").textContent.includes("正在载入"),"JS未完成初始化");
 click('[data-phase="P01"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,8,"准备设计步骤错误");
 click('[data-step="S03"]');
 assert.match(doc.getElementById("step-detail").textContent,/项目基线/);
 click('[data-skill="project-baseline"]');
 assert.equal(doc.getElementById("skill-dialog").open,true,"Skill预览未打开");
 assert.equal(doc.querySelectorAll(".skill-topic-card").length,8,"工程基线8类量化内容未展示");
 assert.match(doc.querySelector(".skill-overview").textContent,/16GiB|16 GiB/);
 assert.match(doc.querySelector(".skill-overview").textContent,/保留|5年/);
 assert.match(doc.querySelector(".skill-summary").textContent,/可量化的设计边界/);
 click('[data-skill-tab="result"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/报价系统项目工程基线/);
 assert.ok(doc.querySelectorAll(".sample-table").length>=6,"成品示例应显示可阅读表格");
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/MySQL 8\.0/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/500GB|500 GB/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/P95≤2\.0秒/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/保存时长|保存年限/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/CPU预算|内存预算|磁盘预算/);
 click('[data-sample="consultation"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/3组最高影响/);
 click('[data-sample="final"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/版本与依据可追溯/);
 click('[data-skill-tab="files"]');
 assert.ok(doc.querySelectorAll("[data-skill-file]").length>=8,"技能目录文件未全部呈现");
 click('[data-skill-file="examples/报价系统-工程基线输出示例.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/第一性原则/);
 click('[data-skill-file="references/checklist.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/项目基线生成覆盖检查/);
 click('[data-skill-file="scripts/check_inputs.py"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/argparse/);
 click("[data-skill-close]");
 click('[data-phase="P02"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,11,"模块开发步骤错误");
 click('[data-phase="P01"]');
 click('[data-step="S04"]');
 click('[data-skill="architecture-baseline"]');
 assert.equal(doc.querySelectorAll(".skill-topic-card").length,5,"整体架构应是内容地图而非同一流程图");
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/运行单元/);
 click('[data-skill-tab="files"]');
 click('[data-skill-file="references/architecture-gate.md"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/整体架构设计检查关卡/);
 click('[data-skill-tab="source"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/具体机制|难以逆转|协作|边界/);
 click("[data-skill-close]");
 click('[data-step="S05"]');
 click('[data-skill="data-architecture"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/数据域/);
 click("[data-skill-close]");
 click('[data-step="S07"]');
 click('[data-skill="module-discovery"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/业务闭环/);
 click("[data-skill-close]");
 click('[data-phase="P02"]');
 click('[data-step="S09"]');
 click('[data-skill="module-design"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/字段|状态机/);
 click("[data-skill-close]");
  click('[data-step="S13"]');
 assert.match(doc.querySelector("#step-detail").textContent,/规范 \+ Spec/);
 click('[data-skill="code-review"]');
 assert.equal(doc.querySelectorAll(".skill-topic-card").length,3,"code-review应该明确审查两个轴和后续原型/人工检查的区别");
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/Standards/);
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/Spec/);
 click("[data-skill-close]");
 click('[data-step="S14"]');
 assert.match(doc.querySelector("#step-detail").textContent,/AI自动测试/);
 click('[data-step="S14H"]');
 assert.match(doc.querySelector("#step-detail").textContent,/人工测试/);
 click('[data-skill="human-acceptance"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/测试/);
 click('[data-skill-tab="source"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/参考原文|借鉴|自动测试/);
 click("[data-skill-close]");
 click('[data-step="S14B"]');
 click('[data-skill="diagnosing-bugs"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/原始症状/);
 click("[data-skill-close]");
 click('[data-phase="P01"]');
 click('[data-step="S03Q"]');
 click('[data-skill="grill-with-docs"]');
 assert.match(doc.querySelector("#skill-dialog-content").textContent,/决策树/);
 click("[data-skill-close]");
 click('[data-phase="PTOOLS"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,6,"通用Skill应在工作阶段显示全部6个");
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
 click('[data-phase="P01"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,8,"退出工具箱后应恢复主项目步骤");
  click('[data-phase="P00"]');
 assert.ok(!doc.querySelector("[data-copy-prompt]"),"准备工作不应出现执行提示词");
 assert.ok(fs.statSync(path.join(root,"dist","skills-bundle.zip")).size>15000,"ZIP不存在或过小");
 const all=fs.readFileSync(path.join(root,"scripts","build_site.py"),"utf8");
 assert.match(all,/33个Skill|33个主/);
 assert.equal(errors.length,0,"浏览器脚本异常："+errors.join("\n"));
 console.log("交互回归通过：Grill、Matt代码双轴审查、专项内容地图、自动联调、人工测试、Bug诊断、工作阶段工具箱、Handoff、完整目录与ZIP");
 dom.window.close();
}
main().catch(err=>{console.error(err);process.exitCode=1;dom.window.close()});
