#!/usr/bin/env node
/* 对正式构建的HTML执行真实DOM交互验证。检查行为、可达性、原图和产物，而非过期文案的精确措辞。 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {JSDOM,VirtualConsole}=require("/tmp/dev-workflow-ui-test/node_modules/jsdom");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"dist","index.html"),"utf8");
const errors=[];
const vc=new VirtualConsole();
vc.on("jsdomError",e=>errors.push(e.message));
const dom=new JSDOM(html,{url:"https://wamper64.github.io/dev-workflow/",runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,
 beforeParse(w){if(!w.HTMLDialogElement.prototype.showModal)w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute("open","")};
 if(!w.HTMLDialogElement.prototype.close)w.HTMLDialogElement.prototype.close=function(){this.removeAttribute("open")}}
});
const doc=dom.window.document;
function click(selector){
 const el=doc.querySelector(selector);
 assert.ok(el,"缺交互入口："+selector);
 el.click();return el;
}
function preview(id){
 click('[data-skill="'+id+'"]');
 assert.ok(doc.getElementById("skill-dialog").open,"无法打开Skill："+id);
 assert.ok(doc.getElementById("skill-dialog-content").textContent.length>80,"Skill快速理解为空："+id);
}
function close(){click("[data-skill-close]");assert.ok(!doc.getElementById("skill-dialog").open,"无法关闭Skill窗口")}
async function run(){
 await new Promise(resolve=>setTimeout(resolve,80));
 const workflow=JSON.parse(doc.getElementById("workflow-data").textContent);
 const payload=JSON.parse(doc.getElementById("skill-data").textContent);
 const cat=JSON.parse(fs.readFileSync(path.join(root,"skills/catalog.json"),"utf8"));
 const workspace=JSON.parse(fs.readFileSync(path.join(root,"skills/workspace.json"),"utf8"));
 const total=new Set([...cat,...workspace].map(x=>x.id));
 assert.equal(cat.length,19);assert.equal(workspace.length,8);
 assert.equal(payload.skills.length,27);
 assert.equal(workflow.phases.length,4,"原始工作流仍须保留验收与部署阶段");
 assert.equal(workflow.phases.flatMap(p=>p.steps).length,19);
 const hiddenPhase=workflow.phases.find(p=>p.id==="P03");
 assert.ok(hiddenPhase&&hiddenPhase.steps.length===3,"不得删除真实验收上线流程");
 const visiblePhases=workflow.phases.filter(p=>p.id!=="P03");
 assert.equal(visiblePhases.length,3);
 assert.equal(doc.querySelectorAll('#stage-list [data-phase]').length,4,"网页应只显示3个研发阶段与通用Skill");
 assert.equal(doc.querySelector('[data-phase="P03"]'),null,"验收上线阶段不应出现在页面导航");
 assert.doesNotMatch(doc.getElementById("stage-list").textContent,/全项目验收与部署上线/);
 assert.match(doc.getElementById("project-stats").textContent,/3 个阶段 · 16 个步骤.*8 个通用Skill/);
 assert.ok(fs.statSync(path.join(root,"dist/skills-bundle.zip")).size>20000,"离线技能包不存在");
 assert.ok(fs.statSync(path.join(root,"dist/regression.html")).size>500,"场景测试可视报告未生成");
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,"dist/regression.json"),"utf8")).total,15);

 // 检查新版三栏布局所需结构及右栏输入/输出和审核。
 assert.ok(doc.querySelector(".workspace > .phase-pane"),"缺左侧研发阶段栏");
 assert.ok(doc.querySelector(".workspace > .steps-pane"),"缺中间步骤栏");
 assert.ok(doc.querySelector(".workspace > .detail-pane"),"缺右侧执行详情");
 assert.ok(doc.querySelector(".header-actions #tree-open")&&doc.querySelector(".header-actions #download-skills"),"右上角操作缺失");
 click('[data-phase="P02"]');click('[data-step="S09"]');
 assert.ok(doc.querySelector(".detail-file-grid .inputs")&&doc.querySelector(".detail-file-grid .outputs"),"输入输出未并排组织");
 assert.ok(doc.querySelector(".detail-skill .skill-mini")&&doc.querySelector(".detail-audit")&&doc.querySelector(".prompt-section"),"详情工作台缺必要板块");
 // 每一阶段、每一步都能真实点击；提示词与当前主Skill一致。
 const seen=new Set();
 for(const ph of visiblePhases){
  click('[data-phase="'+ph.id+'"]');
  for(const step of ph.steps){
   click('[data-step="'+step.id+'"]');
   assert.ok(doc.querySelector('#step-detail h2'),"步骤详情缺失："+step.id);
   const prompt=doc.querySelector("#step-detail .prompt-text")?.textContent||"";
   if(step.skillId){
    assert.ok(prompt.startsWith("/"+step.skillId+"\n"),"Slash命令错误："+step.id);
    assert.ok(prompt.length>=75,"委托提示词没有描述任务："+step.id);
   }else{
    assert.ok(!prompt.startsWith("/"),"无Skill步骤不应产生Slash命令："+step.id);
   }
   const ids=[...doc.querySelectorAll('#step-detail [data-skill]')].map(x=>x.dataset.skill);
   for(const id of ids){
     if(seen.has(id))continue;
     assert.ok(total.has(id),"导航引用未登记Skill："+id);
     preview(id);
     if(id==="architecture-baseline"){
       const visual=doc.querySelector(".architecture-overview-visual img");
       assert.ok(visual&&visual.src.startsWith("data:image/png;base64,"),"架构原图未显示");
       const raw=Buffer.from(visual.src.split(",")[1],"base64");
       assert.equal(crypto.createHash("sha256").update(raw).digest("hex"),
        "aaab1523bf4e3c003defc65549f9436036ac246c57747c70c3d5ba2dfee5d0a9","架构PNG被修改");
     }else{
       assert.ok(doc.querySelector('.skill-illustration img[src^="data:image/svg+xml;base64,"]'),"缺独立流程图："+id);
     }
     click('[data-skill-tab="files"]');
     click('[data-skill-file="SKILL.md"]');
     assert.ok(doc.getElementById("skill-dialog-content").textContent.length>100,"文件内容不能阅读："+id);
     click('[data-skill-tab="source"]');
     assert.match(doc.getElementById("skill-dialog-content").textContent,/参考|来源|采用/,"缺引用来源："+id);
     close();
     seen.add(id);
   }
  }
 }
 // 通用Skill是独立导航区，不替换三个可见研发阶段。
 click('[data-phase="PTOOLS"]');
 assert.equal(doc.querySelectorAll("#step-list button[data-step]").length,8);
 for(const tool of workspace){
  click('[data-step="T_'+tool.id+'"]');
  const prompt=doc.querySelector("#step-detail .prompt-text")?.textContent||"";
  assert.ok(prompt.startsWith("/"+tool.id+"\n"),"通用Skill Slash命令错误："+tool.id);
  if(!seen.has(tool.id)){
    preview(tool.id);
    assert.ok(doc.querySelector('.skill-illustration img[src^="data:image/svg+xml;base64,"]'),"通用Skill缺流程图："+tool.id);
    close();seen.add(tool.id);
  }
 }
 const hiddenSkills=new Set(hiddenPhase.steps.flatMap(s=>s.skills||[]));
 const expectedVisibleSkills=new Set([...total].filter(id=>!hiddenSkills.has(id)));
 assert.deepEqual(seen,expectedVisibleSkills,"可见阶段Skill入口不全，或隐藏阶段Skill被误展示");
 // 旧书签和外部链接不能绕过导航，进入隐藏阶段详情。
 const hashBefore=dom.window.location.hash;
 dom.window.setSelection("P03","S16");
 assert.equal(dom.window.location.hash,hashBefore,"旧链接不能激活隐藏阶段");
 assert.equal(doc.querySelector('[data-phase="P03"]'),null);

 // 多场景切换与复制的不是上次任务旧提示词。
 click('[data-phase="P02"]');click('[data-step="S14B"]');
 const variants=doc.querySelectorAll("[data-prompt-example]");
 assert.ok(variants.length>=3,"Bug诊断缺独立场景");
 const before=doc.querySelector(".prompt-text").textContent;
 click('[data-prompt-example="1"]');
 const after=doc.querySelector(".prompt-text").textContent;
 assert.notEqual(after,before,"切换场景未改变任务委托");
 let copied="";
 Object.defineProperty(dom.window.navigator,"clipboard",{configurable:true,value:{writeText:async s=>{copied=s}}});
 click("[data-copy-prompt]");await Promise.resolve();
 assert.equal(copied,after,"复制的提示词不是当前选中场景");

 // 项目基线不再恢复过期额外文件；模块数量不机械封顶。
 click('[data-phase="P01"]');click('[data-step="S03"]');
 assert.match(doc.getElementById("step-detail").textContent,/项目基线\.md/);
 assert.doesNotMatch(doc.getElementById("step-detail").textContent,/前置约束确认表\.md/);
 click('[data-step="S07"]');preview("module-discovery");
 click('[data-skill-tab="files"]');click('[data-skill-file="SKILL.md"]');
 assert.match(doc.getElementById("skill-dialog-content").textContent,/评审阈值|不强制合并/);
 close();

 // 预期目录树可读，且不是声称已交付这些文件。
 click("#tree-open");
 assert.ok(doc.getElementById("tree-dialog").open);
 assert.match(doc.getElementById("tree-content").textContent,/项目根目录|code\//);
 assert.doesNotMatch(doc.getElementById("tree-content").textContent,/项目基线前置约束确认表\.md/);
 click("[data-tree-close]");

 assert.equal(errors.length,0,"页面运行错误："+errors.join("；"));
 console.log("交互回归通过：3个可见研发阶段、16个可见步骤、"+seen.size+"个可见Skill入口；验收上线数据保留但HTML隐藏，深链不可进入；其余图片、文件预览、来源、复制、离线包和目录树正常。");
 dom.window.close();
}
run().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
