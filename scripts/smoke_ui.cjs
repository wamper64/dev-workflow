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
 assert.equal(doc.querySelectorAll("#stage-list button[data-phase]").length,5,"阶段不可点击");
 assert.ok(!doc.getElementById("project-stats").textContent.includes("正在载入"),"JS未完成初始化");
 click('[data-phase="P01"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,7,"准备设计步骤错误");
 click('[data-step="S03"]');
 assert.match(doc.getElementById("step-detail").textContent,/项目基线/);
 click('[data-skill="project-baseline"]');
 assert.equal(doc.getElementById("skill-dialog").open,true,"Skill预览未打开");
 assert.ok(doc.querySelector(".logic-decision"),"业务决策流程图不存在");
 assert.match(doc.querySelector(".logic-decision").textContent,/关键指标|现实约束/);
 click('[data-skill-tab="files"]');
 assert.ok(doc.querySelectorAll("[data-skill-file]").length>=8,"技能目录文件未全部呈现");
 click('[data-skill-file="references/checklist.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/工程基线内容检查清单/);
 click('[data-skill-file="scripts/check_inputs.py"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/argparse/);
 click("[data-skill-close]");
 click('[data-phase="P00"]');
 assert.ok(!doc.querySelector("[data-copy-prompt]"),"准备工作不应出现执行提示词");
 assert.ok(fs.statSync(path.join(root,"dist","skills-bundle.zip")).size>15000,"ZIP不存在或过小");
 assert.equal(errors.length,0,"浏览器脚本异常："+errors.join("\n"));
 console.log("交互回归通过：阶段→步骤→Skill流程→完整目录→脚本→准备工作无提示词→ZIP");
 dom.window.close();
}
main().catch(err=>{console.error(err);process.exitCode=1;dom.window.close()});
