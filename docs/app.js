const ui={data:null,phase:"P01",step:"S01",promptChoice:0};
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toolkitTaskPrompts={
 "grill-me":"需要澄清的决策：<问题或文档路径>。请以当前会话内容为输入，不假设存在代码目录。",
 "improve-codebase-architecture":"请读取 `code/` 中的实际工程、相关架构/模块设计文档和近期 Git Diff，评估架构改善机会。目标范围：<模块或目录>。",
 "handoff":"请根据当前会话、工作区 Git 状态/未提交 Diff、关联 Spec/Tickets 与测试记录生成交接。交接对象：<新会话或协作者>。",
 "triage":"请读取待分诊 Issue/PR、`docs/agents/issue-tracker.md`，并按需读取关联 Spec、模块设计与代码。待分诊入口：<Issue/PR 链接或列表>。",
 "prototype":"请读取 `docs/input/需求资料/` 中对应 PRD/原型及 `code/` 中现有页面。要验证的问题：<状态或交互>。只生成临时验证原型，不覆盖正式原型。",
 "implement":"请读取 `<Ticket 路径或编号>`、关联 Spec、模块详细设计和 `code/` 中对应实现，仅实现该 Ticket。",
 "wayfinder":"请读取当前会话中的目标说明、`docs/input/`、现有 `docs/output/` 和已有 Map/决策记录，建立或更新决策地图。目标：<最终结果>。",
 "research":"请读取 `docs/input/` 中相关原始资料及现有架构/设计文档，围绕 <研究问题> 使用一手来源调查，并将结论写入 <输出 Markdown 路径>。"
};
const toolkitPhase=()=>({
 id:"PTOOLS",
 title:"通用 Skills",
 kind:"toolkit",
 owner:"按需使用的开发人员、项目经理或技术总监",
 description:"仅显示用户指定、且没有在项目准备与设计和模块迭代开发中直接或内部固定调用的Matt工具。它们按需调用，不新增强制研发阶段。",
 steps:(skillData?.workspace||[]).map(w=>({
   id:"T_"+w.id,
   title:w.name,
   skills:[w.id],
   skillId:w.id,
   summary:w.summary,
   input:w.diagram?.input||"当前会话或实际项目上下文",
   output:w.diagram?.output||"依据调用目标确定",
   workflow:w.diagram?.work||[],
   limitation:w.diagram?.fail||"由具体任务决定是否需要",
   prompt:"/"+w.id+"\n\n"+(toolkitTaskPrompts[w.id]||"请根据当前任务执行。"),
   source:w.source?.url||""
 }))
});
// 仅控制导航网页的展示，不改变真实工作流数据与Skill定义。
const visiblePhases=()=>ui.data.phases.filter(p=>p.id!=="P03");
const allPhases=()=>[...visiblePhases(),toolkitPhase()];
const phase=()=>allPhases().find(p=>p.id===ui.phase)||visiblePhases()[0];
const step=()=>phase().steps.find(s=>s.id===ui.step)||phase().steps[0];
const kind=k=>k==="toolkit"?"跨阶段可调用":k==="prep"?"仅展示初始输入":k==="repeat"?"按模块循环":k==="acceptance"?"业务验收":k==="quality"?"系统质量验收":k==="release"?"分环境与版本部署":k==="final"?"整体验收与交付":"项目建设阶段";
// 项目目录树是来源于当前阶段与步骤约定的中文展示文件，避免硬编码到Skill内容。
const projectTree=JSON.parse(document.getElementById("project-tree-data").textContent);
document.addEventListener("click",async event=>{
 if(event.target.closest("#tree-open")){
  $("tree-content").textContent=projectTree;
  const dialog=$("tree-dialog");if(!dialog.open)dialog.showModal();
 }else if(event.target.closest("[data-tree-close]")){$("tree-dialog").close()}
 else if(event.target.closest("[data-tree-copy]")){
  const btn=event.target.closest("button");
  try{await navigator.clipboard.writeText(projectTree);btn.textContent="已复制目录树"}
  catch(err){btn.textContent="无法复制，请手动选择下方文本"}
 }
});
const fileList=files=>'<div class="file-list">'+(files||[]).map(f=>'<code class="file-item">'+esc(f.trim())+'</code>').join("")+'</div>';
function activePrompt(s){
 const choices=Array.isArray(s.promptExamples)?s.promptExamples:[];
 return choices[ui.promptChoice]?.prompt||s.prompt||"";
}
function promptSection(s,title){
 const examples=Array.isArray(s.promptExamples)?s.promptExamples:[];
 const buttons=examples.length>1?'<div class="prompt-choices" role="group" aria-label="选择提示词示例">'+examples.map((x,i)=>
   '<button type="button" class="prompt-choice '+(i===ui.promptChoice?'active':'')+'" data-prompt-example="'+i+'" aria-pressed="'+String(i===ui.promptChoice)+'">'+esc(x.label)+'</button>').join("")+'</div>':"";
 const chosen=examples[ui.promptChoice];
 const tip=chosen?.example?'这是演示情景，复制后先替换为真实问题、环境与证据。':examples.length>1?'选择适用情景，把 <...> 中的内容替换成当前项目事实。':'请根据当前任务的实际信息执行。';
 return '<section class="detail-section prompt-section"><div class="prompt-heading"><h3><span class="section-icon">✎</span> '+esc(title)+'</h3><button type="button" class="copy-prompt" data-copy-prompt>复制当前提示词</button></div>'+buttons+'<div class="prompt-text">'+esc(activePrompt(s))+'</div><p class="detail-hint">'+esc(tip)+'</p></section>';
}
const skillList=skills=>!(skills||[]).length?'<div class="review-box">这里只展示已有输入，无需调用Skill。</div>':'<div class="skill-grid">'+(skills||[]).map(id=>{const sk=skillData?.skills?.find(x=>x.id===id);const origin=sk?.type||"类型未登记";return '<button type="button" class="skill-pill '+(origin==="Matt原版"?"":"custom")+'" data-skill="'+esc(id)+'" title="点击查看SKILL.md、逻辑流程、示例与模板">'+esc(id)+' <span class="skill-kind">'+esc(origin)+'</span> ↗</button>'}).join("")+'</div>';
function renderStages(){
  const phases=visiblePhases();
  $("project-stats").textContent=phases.length+" 个阶段 · "+phases.reduce((n,p)=>n+p.steps.length,0)+" 个步骤 · "+(skillData?.workspace.length||0)+" 个通用Skill";
  $("stage-list").innerHTML=phases.map((p,i)=>
    '<button type="button" class="stage-item '+(p.id===ui.phase?"active":"")+'" data-phase="'+esc(p.id)+'" aria-current="'+(p.id===ui.phase?"step":"false")+'"><span class="stage-index">'+String(i).padStart(2,"0")+'</span><span class="stage-body"><span class="stage-title">'+esc(p.title)+'</span><span class="stage-meta">'+p.steps.length+' 个步骤'+(p.kind==="repeat"?" · 循环":"")+'</span></span><span class="stage-arrow" aria-hidden="true">›</span></button>'
  ).join("")+'<div class="stage-toolkit-separator" role="separator">跨阶段工具</div>'+
  '<button type="button" class="stage-item stage-toolkit '+(ui.phase==="PTOOLS"?"active":"")+'" data-phase="PTOOLS" aria-current="'+(ui.phase==="PTOOLS"?"step":"false")+'"><span class="stage-index">✦</span><span class="stage-body"><span class="stage-title">通用 Skills</span><span class="stage-meta">'+(skillData?.workspace.length||0)+' 个 · 随时使用</span></span><span class="stage-arrow" aria-hidden="true">›</span></button>';
}
function renderSteps(){
  const p=phase(),i=visiblePhases().indexOf(p)+1;
  $("stage-intro").innerHTML='<h1>'+esc(p.title)+'</h1><p class="stage-desc">'+esc(p.description)+'</p><span class="stage-type">'+kind(p.kind)+'</span>';
  const route=p.id==="P01"?"输入核验 → Skills初始化 → 项目基线 → <b>整体架构（内置Grill）</b> → 数据库总体 → 初次部署 → 模块拆分":p.id==="P02"?"<b>本轮模块设计（Grill）</b> → Spec → Tickets → <b>TDD实现+Review</b> → <b>人工测试与签收</b> → 按需Bug修复 → <b>Retro</b> → 下一轮":p.id==="P03"?"<b>系统业务验收</b> → <b>系统性能验收</b> → <b>上线部署</b>（开发/测试 × 首次/更新）":p.kind==="toolkit"?"按任务需要选择合适的通用工具":"已确认需求基线 + docs/input/ + code/";
  const routeEl=$("phase-route"); if(routeEl)routeEl.innerHTML=route.split(" → ").map(x=>'<span class="route-chip">'+x+'</span>').join('<span class="route-arrow">→</span>');
  $("step-count").textContent=p.kind==="toolkit"?p.steps.length+" 个通用Skill":p.steps.length+" 项工作";
 $("step-heading-title").textContent=p.kind==="toolkit"?"通用 Skill 列表":"执行步骤";
  $("step-list").innerHTML=p.steps.map((s,k)=>
    '<button type="button" class="step-item '+(s.id===ui.step?"active":"")+'" data-step="'+esc(s.id)+'" aria-current="'+(s.id===ui.step?"step":"false")+'"><span class="step-index">'+(k+1)+'</span><span class="step-body"><strong>'+esc(s.title)+'</strong><small>'+(p.kind==="toolkit"?esc("/"+s.skillId)+" · 按需调用":"阶段 "+i+" · "+s.id)+'</small></span><span class="step-chevron" aria-hidden="true">›</span></button>'
  ).join("");
}

// 用户填入的是开发环境的事实，而不是AI推断结果；只缓存本浏览器非敏感字段
// 右侧执行工作台：优先让 Skill 定位、输入输出、审核和复制命令一屏可读。
function renderDetails(){
  const p=phase(),s=step(),index=p.steps.indexOf(s)+1;
  $("step-position").textContent=String(index).padStart(2,"0")+" / "+String(p.steps.length).padStart(2,"0");
  const ids=p.kind==="toolkit"?s.skills||[]:s.skills||[];
  const skillCards=(ids.length?ids:[]).map(id=>{
    const sk=skillData?.skills?.find(x=>x.id===id);
    const summary=sk?.overview?.headline||sk?.summary||sk?.diagram?.outcome||"点击打开完整Skill规则、流程和参考资料";
    const image=sk?.overview?.visual?.src||sk?.illustration?.src;
    return '<article class="skill-mini">'+(image?'<img class="skill-mini-thumb" src="'+esc(image)+'" alt="'+esc(id)+'流程缩略图" loading="lazy">':'')+
      '<div class="skill-mini-body"><div class="skill-mini-title">'+esc(sk?.name||id)+'<span class="skill-mini-kind">'+esc(sk?.type||"已登记Skill")+'</span></div>'+
      '<p class="skill-mini-summary">'+esc(summary)+'</p><button type="button" class="skill-open" data-skill="'+esc(id)+'">查看 Skill、流程图与文件 ↗</button></div></article>';
  }).join("");
  const extraSkills=[...(Array.isArray(s.invokes)?s.invokes:[]),...(s.id==="S12"?["code-review"]:[])].filter(id=>!ids.includes(id));
  const extra=extraSkills.length?'<details class="detail-extra"><summary>内部调用 / 关联 Skill（'+extraSkills.length+'）</summary>'+
    '<p>这些属于主 Skill 执行过程中按需使用的能力，不新增工作步骤。</p>'+skillList(extraSkills)+'</details>':"";
  const inputs=p.kind==="toolkit"?[s.input]:s.inputs||[];
  const outputs=p.kind==="toolkit"?[s.output]:s.outputs||[];
  const review=p.kind==="toolkit"?(s.limitation||"根据真实任务确认适用性与结果"):s.review||"按当前步骤责任角色审核真实证据";
  const owner=p.kind==="toolkit"?"按任务需要由负责人判断":p.owner;
  const section=(title,cls,files)=>'<section class="detail-section detail-io '+cls+'"><h3>'+title+'<small>'+files.length+'项</small></h3>'+fileList(files)+'</section>';
  let content='<header class="detail-heading"><div><h2>'+esc(s.title)+'</h2><p class="step-context">'+esc(p.title)+' · '+esc(s.id)+'</p></div><span class="detail-heading-tag">'+(p.kind==="toolkit"?"按需工具":s.skillId?"Skill步骤":"人工 / 只读")+'</span></header>';
  content+='<section class="detail-section detail-skill"><div class="detail-section-title"><h3>使用的 Skill 与作用</h3><small>点击查看完整规则</small></div>'+
    (skillCards||'<div class="skill-empty">'+(s.id==="S01"?"只读核验输入资料，不需要额外Skill。":"此步骤无需调用 Skill；按既有资料与审核执行。")+'</div>')+
    extra+'</section>';
  if(p.kind==="toolkit"){
    content+='<p class="toolkit-summary">'+esc(s.summary)+'</p>';
  }
  content+='<div class="detail-file-grid">'+section("输入文件 / 上下文","inputs",inputs)+section("输出文件 / 产物","outputs",outputs)+'</div>';
  content+='<section class="detail-section detail-audit"><h3>审核与放行</h3><p>'+esc(review)+'</p><span class="detail-owner">责任：'+esc(owner)+'</span></section>';
  if(s.prompt&&p.id!=="P00")content+=promptSection(s,"执行提示词");
  if(p.kind==="toolkit" && Array.isArray(s.workflow)&&s.workflow.length){
    content+='<details class="detail-extra"><summary>具体执行动作（'+s.workflow.length+'步）</summary><ol>'+s.workflow.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></details>';
  }
  if(p.id==="P02")content+='<details class="detail-extra"><summary>查看本轮模块迭代完整闭环</summary><ol>'+(ui.data.iterationFlow||[]).map(x=>'<li>'+esc(x.title)+'</li>').join("")+'</ol></details>';
  $("step-detail").innerHTML=content;
}

function setSelection(phaseId,stepId,moveFocus=false){
  const next=allPhases().find(p=>p.id===phaseId);
  if(!next)return;
  ui.phase=next.id;
  const selected=next.steps.some(s=>s.id===stepId)?stepId:next.steps[0].id;
  if(ui.phase!==next.id||ui.step!==selected)ui.promptChoice=0;
  ui.step=selected;
  const params=new URLSearchParams({phase:ui.phase,step:ui.step});
  history.replaceState(null,"","#"+params.toString());
  renderStages();renderSteps();renderDetails();
  if(moveFocus&&innerWidth<781){$("steps-pane").scrollIntoView({behavior:"smooth",block:"start"});}
}

let skillData=null;
let currentSkill=null;
let currentSkillTab="flow";
let currentResult="final";
let currentFile="SKILL.md";
let showFileSource=false;
function logicDiagram(d){
 if(!d)return '<p>该技能的速览内容尚未配置。</p>';
 const actions=(d.work||[]).map((s,i)=>'<div class="logic-node work"><span class="logic-ordinal">'+(i+1)+'</span><span>'+esc(s)+'</span></div>').join('<div class="logic-arrow">↓</div>');
 return '<div class="logic-goal"><div class="logic-kicker">这个 Skill 解决什么</div><strong>'+esc(d.outcome)+'</strong></div>'
 +'<div class="logic-node start"><span class="logic-kicker">输入 / 上游条件</span><b>'+esc(d.input)+'</b></div>'
 +'<div class="logic-arrow">↓</div><div class="logic-steps">'+actions+'</div><div class="logic-arrow">↓</div>'
 +'<div class="logic-decision"><span class="logic-kicker">关键决策</span><b>'+esc(d.gate)+'</b></div>'
 +'<div class="logic-forks"><div class="logic-branch negative"><span>需要处理 / 不通过　↶</span><strong>'+esc(d.fail)+'</strong><small>退回补证据、提问或修正后重新检查</small></div>'
 +'<div class="logic-branch positive"><span>可以继续 / 通过　↓</span><strong>'+esc(d.pass)+'</strong></div></div>'
 +'<div class="logic-arrow">↓</div><div class="logic-output"><span class="logic-kicker">最后交付什么</span><strong>'+esc(d.output)+'</strong></div>';
}

function renderCodeReviewAxes(skill){
 const parts=skill.reviewAxes||[];
 return '<div class="source-detail"><h3>Matt code-review 的审查范围</h3><p>它首先固定Git Diff与来源Spec，通过 Standards 与 Spec 两个相互独立的评审轴发现代码问题。原型结构/视觉和人工业务验收是后续关卡，不能仅因两轴代码审查通过就宣称完成。</p>'
 +'<div class="skill-topic-grid">'+parts.map((x,i)=>'<article class="skill-topic-card"><span class="skill-topic-index">'+String(i+1).padStart(2,"0")+'</span><h4>'+esc(x.title)+'</h4><p>'+esc(x.detail)+'</p></article>').join("")+'</div><p class="flow-note">流程：固定比较基准与Spec → Standards/Spec双轴审查 → 修复并复审 → 真实联调/原型与人工验证</p></div>';
}


/* 设计阶段快速理解：流程先于具体落地项，帮助审核人定位未覆盖范围。 */
function renderSkillFlow(f){
 if(!f?.steps?.length)return "";
 const nodes=f.steps.map((x,i)=>'<div class="quick-route-node"><span>'+String(i+1).padStart(2,"0")+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.detail||"")+'</small></div>').join('<span class="quick-route-arrow" aria-hidden="true">→</span>');
 // 支持部署配置/部署执行两道不同的审核关；普通Skill仍沿用一个审核关。
 const checkpoints=Array.isArray(f.gates)&&f.gates.length?f.gates:[f.gate||{}];
 const checkHTML=checkpoints.map((g,i)=>'<div class="quick-route-check"><div class="quick-route-gate"><b>'+esc(g.title||"审核关口")+"："+"</b>"+esc(g.question||"")+'</div><div class="quick-route-branch"><p><b>✓ 通过</b>'+esc(g.pass||"按流程推进")+'</p><p><b>↶ 未通过</b>'+esc(g.fail||"补齐证据后重新检查")+'</p></div></div>').join("");
 return '<section class="quick-route"><div class="skill-overview-title"><h3>'+esc(f.title||"Skill执行流程")+'</h3><span>顺序与退回路径</span></div><div class="quick-route-track">'+nodes+'</div>'
 +'<div class="quick-route-checkpoints" data-count="'+checkpoints.length+'">'+checkHTML+'</div></section>';
}
function renderSkillCoverage(a){
 const items=a.coverage||[];
 if(!items.length)return "";
 const entries=items.map((x,i)=>'<div class="quick-coverage-row"><div class="quick-coverage-name"><small>'+String(i+1).padStart(2,"0")+'</small><b>'+esc(x.title)+'</b></div><div><em>必须包含</em>'+esc(x.must)+'</div><div><em>应有产物</em>'+esc(x.evidence)+'</div><div class="quick-coverage-risk"><em>缺失信号</em>'+esc(x.gap)+'</div></div>').join("");
 return '<section class="quick-coverage"><div class="skill-overview-title"><h3>内容覆盖速查：缺什么一眼可见</h3><span>'+items.length+'个核对维度</span></div><p class="quick-coverage-note">'+esc(a.coverageNote||"这里展示应有内容，并不表示实际已完成。")+'</p><div class="quick-coverage-grid"><div class="quick-coverage-header"><b>维度</b><b>必须明确的具体项</b><b>产物/证据</b><b>常见遗漏</b></div>'+entries+'</div></section>';
}
function renderSkillOverview(skill){
 const a=skill.overview;
 // 每个Skill拥有独立的流程信息图；S04继续使用用户指定的PNG原图。
 const img=skill.illustration?'<figure class="skill-illustration"><a href="'+esc(skill.illustration.src)+'" target="_blank" rel="noopener noreferrer" aria-label="查看流程图片"><img src="'+esc(skill.illustration.src)+'" alt="'+esc(skill.illustration.alt)+'" loading="lazy"></a><figcaption>Skill执行步骤与审核关系（示意，不代表已完成）</figcaption></figure>':"";
 if(!a)return img+(skill.reviewAxes?renderCodeReviewAxes(skill):logicDiagram(skill.diagram));
  const facts=(a.quickFacts||[]).map(x=>'<div class="skill-quick-fact"><b>'+esc(x.label)+'</b><span>'+esc(x.value)+'</span></div>').join("");
  const pillarCards=(a.pillars||[]).map((p,i)=>{
    const items=(p.items||[]).map(t=>'<li>'+esc(t)+'</li>').join("");
    return '<article class="skill-pillar"><div class="skill-pillar-number">核心 '+(i+1)+'</div><h3>'+esc(p.title)+'</h3><p class="skill-pillar-question">'+esc(p.question)+'</p><ul>'+items+'</ul><div class="skill-pillar-result"><b>交付</b>'+esc(p.deliverable)+'</div><div class="skill-pillar-result"><b>通过标准</b>'+esc(p.pass)+'</div></article>';
  }).join("");
  const chain=a.chainExample?('<section class="skill-chain"><h3>'+esc(a.chainExample.title)+'</h3><div class="skill-chain-track">'+(a.chainExample.steps||[]).map((stage,i)=>'<div class="skill-chain-step"><span>'+String(i+1).padStart(2,"0")+'</span>'+esc(stage)+'</div>').join('<span class="skill-chain-arrow">→</span>')+'</div><div class="skill-chain-exits"><b>必须包含的分支/失败处理</b><ul>'+(a.chainExample.checkpoints||[]).map(t=>'<li>'+esc(t)+'</li>').join("")+'</ul></div><p class="skill-chain-distinction">'+esc(a.chainExample.distinction||"")+'</p></section>'):"";
  const groupSets=(a.sectionGroups||[]).map(g=>{
    const child=(a.sections||[]).filter(s=>s.axis===g.key).map((s,i)=>renderTopicCard(s,i)).join("");
    return '<section class="skill-overview-group"><div class="skill-overview-title"><h3>'+esc(g.label)+'</h3><span>'+esc(g.description||"")+'</span></div><div class="skill-topic-grid">'+child+'</div></section>';
  }).join("");
  function renderTopicCard(x,i){
    const checks=(x.checks||[]).map(v=>'<li>'+esc(v)+'</li>').join("");
    const detail=checks?'<div class="skill-topic-details"><b>必须明确的具体项</b><ul>'+checks+'</ul></div>':"";
    const output=x.deliverable?'<div class="skill-topic-delivery"><b>形成产物</b><span>'+esc(x.deliverable)+'</span></div>':"";
    const pass=x.pass?'<div class="skill-topic-gate"><b>完成判定</b><span>'+esc(x.pass)+'</span></div>':"";
    const example=x.sample?'<div class="skill-topic-example"><span>'+esc(a.exampleLabel||"示例（报价项目）")+'</span>'+esc(x.sample)+'</div>':"";
    return '<article class="skill-topic-card"><span class="skill-topic-index">'+String(i+1).padStart(2,"0")+'</span><h4>'+esc(x.title)+'</h4><p>'+esc(x.summary)+'</p>'+detail+output+pass+example+'</article>';
  }
  const cards=(a.sections||[]).map((x,i)=>{
    const checks=(x.checks||[]).map(v=>'<li>'+esc(v)+'</li>').join("");
    const detail=checks?'<div class="skill-topic-details"><b>必须明确的具体项</b><ul>'+checks+'</ul></div>':"";
    const output=x.deliverable?'<div class="skill-topic-delivery"><b>形成产物</b><span>'+esc(x.deliverable)+'</span></div>':"";
    const pass=x.pass?'<div class="skill-topic-gate"><b>完成判定</b><span>'+esc(x.pass)+'</span></div>':"";
    const example=x.sample?'<div class="skill-topic-example"><span>'+esc(a.exampleLabel||"示例（报价项目）")+'</span>'+esc(x.sample)+'</div>':"";
    return '<article class="skill-topic-card"><span class="skill-topic-index">'+String(i+1).padStart(2,"0")+'</span><h4>'+esc(x.title)+'</h4><p>'+esc(x.summary)+'</p>'+detail+output+pass+example+'</article>';
  }).join("");
 const conversions=(a.thinking||[]).map(x=>'<div class="thinking-row"><div><span class="thinking-label">资料中有什么</span><p>'+esc(x.given)+'</p></div><span class="thinking-arrow">→</span><div><span class="thinking-label">Skill 提炼什么</span><p>'+esc(x.answer)+'</p></div></div>').join("");
 const exclusions=(a.doesNot||[]).map(x=>'<li>'+esc(x)+'</li>').join("");
 const visual=a.visual?'<figure class="architecture-overview-visual"><a href="'+esc(a.visual.src)+'" target="_blank" rel="noopener noreferrer" aria-label="查看架构流程大图"><img src="'+esc(a.visual.src)+'" alt="'+esc(a.visual.alt)+'" loading="lazy"></a><figcaption>'+esc(a.visual.caption)+'</figcaption></figure>':"";
 return '<div class="skill-overview">'+visual+img+'<div class="skill-summary"><span>一句话理解</span><h3>'+esc(a.headline)+'</h3><p>'+esc(a.why)+'</p><div class="skill-summary-output"><b>交付产物</b> '+esc(a.result)+'</div></div>'
  +(facts?'<div class="skill-quick-facts">'+facts+'</div>':"")
  +(pillarCards?'<div class="skill-pillar-heading"><h3>'+esc(a.pillarsTitle||"整体架构的两个核心")+'</h3><p>'+esc(a.pillarsDescription||"先从业务链路反推组件，再用组件架构约束处理流程；两个核心必须互相闭合。")+'</p></div><div class="skill-pillars" data-count="'+(a.pillars||[]).length+'">'+pillarCards+'</div>':"")
  +renderSkillFlow(a.workflow)
  +renderSkillCoverage(a)
  +chain
  +'<div class="skill-overview-title"><h3>'+esc(a.sectionsTitle||"此 Skill 涵盖的关键内容") +'</h3><span>'+(a.sections||[]).length+'个具体板块</span></div>'
  +(groupSets||'<div class="skill-topic-grid">'+cards+'</div>')
 +(conversions?'<div class="skill-overview-title"><h3>'+esc(a.conversionTitle||"输入信息如何形成关键决定？") +'</h3></div><div class="thinking-grid">'+conversions+'</div>':"")
 +'<div class="skill-overview-title"><h3>本 Skill 不处理的内容</h3></div><ul class="skill-exclusions">'+exclusions+'</ul>'
 +(skill.outputSampleFile?'<div class="skill-cta"><span>先查看报价项目示例，再决定是否细读SKILL.md</span><button type="button" data-skill-tab="result">查看示例 →</button></div>':'')+'</div>';
}
function richInline(s){
 return esc(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
}
function renderSampleMarkdown(content){
 const lines=String(content||"").split(/\r?\n/);
 let out='<article class="sample-document">',i=0;
 while(i<lines.length){
  const row=lines[i].trim();if(!row){i++;continue}
  if(row.startsWith("|")&&row.endsWith("|")){
   let buf=[];while(i<lines.length&&lines[i].trim().startsWith("|")&&lines[i].trim().endsWith("|")){buf.push(lines[i].trim());i++}
   const data=buf.map(x=>x.slice(1,-1).split("|").map(y=>y.trim()));
   const sep=r=>r.every(x=>/^:?-{3,}:?$/.test(x));
   const hasHead=data.length>1&&sep(data[1]);
   const table=hasHead?[data[0],...data.slice(2)]:data;
   out+='<div class="sample-table-wrap"><table class="sample-table">';
   table.forEach((cells,k)=>{const tag=hasHead&&k===0?"th":"td";out+='<tr>'+cells.map(c=>'<'+tag+'>'+richInline(c)+'</'+tag+'>').join("")+'</tr>'});
   out+='</table></div>';continue
  }
  const heading=row.match(/^(#{1,4})\s+(.+)$/);
  if(heading){const level=Math.min(heading[1].length+1,5);out+='<h'+level+'>'+richInline(heading[2])+'</h'+level+'>';i++;continue}
  if(/^[-_]{3,}$/.test(row)){out+='<hr>';i++;continue}
  if(row.startsWith(">")){out+='<blockquote class="sample-notice">'+richInline(row.replace(/^>\s?/,""))+'</blockquote>';i++;continue}
  if(/^[-*]\s+/.test(row)){out+='<div class="sample-list">• '+richInline(row.slice(2))+'</div>';i++;continue}
  out+='<p>'+richInline(row)+'</p>';i++;
 }
 return out+'</article>';
}
function renderSkillResult(){
 const s=currentSkill;
 const selected=currentResult==="consultation"&&s?.consultationFile?s.consultationFile:s?.outputSampleFile;
 if(!selected||!skillData?.examples?.[selected])return '<p class="sample-empty">此步骤暂未配置独立的示例文档。</p>';
 return '<div class="sample-head"><div><strong>'+esc(s.sampleTitle||"报价项目示例输出")+'</strong><p>这是以报价业务制作的示范内容，不是已运行真实客户PRD后的正式审批结果；是否为完整成品以本Skill示例说明为准。</p></div><div class="sample-actions"><button data-sample="final" class="'+(currentResult==="final"?"active":"")+'">'+(s.consultationFile?"工程基线成品":"报价项目示例")+'</button>'+(s.consultationFile?'<button data-sample="consultation" class="'+(currentResult==="consultation"?"active":"")+'">AI澄清过程</button>':"")+'</div></div>'
 +renderSampleMarkdown(skillData.examples[selected]);
}

function renderMd(text){
 let html="",code=false,block=[];
 const flush=()=>{if(block.length){html+='<div class="md-paragraph">'+block.map(esc).join(" ")+'</div>';block=[]}};
 for(const row of String(text).split(/\r?\n/)){
   if(/^\s*```/.test(row)){flush();if(code){html+="</code></pre>";code=false}else{html+='<pre class="md-code"><code>';code=true}continue}
   if(code){html+=esc(row)+"\n";continue}
   const h=row.match(/^(#{1,4})\s+(.+)/);
   if(h){flush();html+='<h'+Math.min(h[1].length+1,5)+'>'+esc(h[2])+'</h'+Math.min(h[1].length+1,5)+'>';continue}
   if(!row.trim()){flush();continue}
   if(/^---+$/.test(row.trim())){flush();html+="<hr>";continue}
   if(/^\s*[-*]\s+/.test(row)){flush();html+='<div class="md-list-item">• '+esc(row.replace(/^\s*[-*]\s+/,""))+'</div>';continue}
   if(/^\s*\d+\.\s+/.test(row)){flush();html+='<div class="md-list-item">'+esc(row.trim())+'</div>';continue}
   if(row.trim().startsWith("|")){flush();html+='<pre class="md-table">'+esc(row)+'</pre>';continue}
   if(/^>\s*/.test(row)){flush();html+='<blockquote class="md-quote">'+esc(row.replace(/^>\s*/,""))+'</blockquote>';continue}
   block.push(row);
 }
 flush();if(code)html+="</code></pre>";
 return '<div class="rendered-markdown">'+html+'</div>';
}
function renderFiles(){
 const all=currentSkill?.files||{};
 const paths=Object.keys(all).sort((a,b)=>a==="SKILL.md"?-1:b==="SKILL.md"?1:a.localeCompare(b,"zh-CN"));
 if(!paths.includes(currentFile))currentFile=paths[0]||"SKILL.md";
 const options=paths.map(path=>{const depth=path.split("/").length-1;
   return '<button type="button" class="skill-file '+(path===currentFile?"active":"")+'" data-skill-file="'+esc(path)+'" style="padding-left:'+(12+depth*10)+'px" title="'+esc(path)+'">'+esc(path.split("/").at(-1))+'<small>'+esc(path.includes("/")?path.substring(0,path.lastIndexOf("/"))+"/":"根目录")+'</small></button>'
 }).join("");
 const content=all[currentFile]||"";
 const markdown=/\.md$/i.test(currentFile);
 const view=showFileSource||!markdown?'<pre class="skill-file-code">'+esc(content)+'</pre>':renderMd(content);
 return '<div class="file-explorer"><aside class="file-sidebar"><div class="file-sidebar-title">所有目录文件 <span>'+paths.length+'</span></div>'+options+'</aside>'
 +'<section class="file-preview"><div class="file-toolbar"><strong>'+esc(currentFile)+'</strong><button type="button" data-file-toggle>'+ (showFileSource?"阅读模式":"查看原文")+'</button></div>'+view+'</section></div>';
}

function renderSkillSources(skill){
 const rs=skill.referenceLearnings||[];
 return '<div class="source-detail"><h3>为什么参考这些Skill？</h3><p>这里只记录调研来源、实际借鉴的机制和本项目适配范围，绝不会插进用户下载安装的SKILL.md正文。</p>'
 +'<div class="research-type"><strong>采用方式：</strong>'+esc(skill.type||"Matt原版")+'</div>'
 +'<div class="research-rows">'+rs.map(x=>'<article class="research-row"><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.name||"参考源文件")+' ↗</a><p><strong>具体学习：</strong>'+esc(x.learned)+'</p></article>').join("")+'</div>'
 +'<p class="source-adaptation"><strong>实际采用与定制化改造：</strong>'+esc(skill.adaptation||"Matt官方原版保持不变。")+'</p>'
 +(!rs.length?'<p>暂无足够的逐项研究笔记，需要继续核实原始Skill文件，不能只凭仓库名称声称已参考。</p>':"")
 +'<p class="research-boundary">Matt原版保持不改；参考来源只在网站中展示。报价项目示例独立存放于 docs/examples/报价项目/，不属于可安装Skill文件目录。</p></div>';
}
function previewSkill(id){
 const item=skillData?.skills?.find(x=>x.id===id);
 if(!item)return;
 currentSkill=item;currentSkillTab="flow";currentResult="final";currentFile="SKILL.md";showFileSource=false;
 $("skill-dialog-title").textContent=id;
 const current=phase()?.steps?.find(st=>st.id===ui.step&&st.skills?.includes(id));
 $("skill-dialog-label").textContent=(current?.title||item.stepTitle)+" · "+(item.maturity||"官方原版")+" · 实际文件："+Object.keys(item.files||{}).length+" 个";
 refreshSkillPreview();
 const dlg=$("skill-dialog");if(!dlg.open)dlg.showModal();
}
function refreshSkillPreview(){
 const sk=currentSkill;if(!sk)return;
 document.querySelectorAll(".skill-dialog-tabs [data-skill-tab]").forEach(t=>{if(t.dataset.skillTab==="result")t.hidden=!sk.outputSampleFile;const active=t.dataset.skillTab===currentSkillTab;t.classList.toggle("active",active);t.setAttribute("aria-selected",String(active))});
 let content=currentSkillTab==="flow"?renderSkillOverview(sk):currentSkillTab==="result"?renderSkillResult():currentSkillTab==="files"?renderFiles():renderSkillSources(sk);
 $("skill-dialog-content").innerHTML=content;
 const a=sk.source;
 $("skill-reference").innerHTML='<span>研究来源：</span><a href="'+esc(a.url)+'" target="_blank" rel="noopener noreferrer">'+esc(a.name||a.repo)+'</a> <span class="skill-aux">（不属于交付正文）</span>';
}
document.addEventListener("click",event=>{
 const skill=event.target.closest("[data-skill]");
 if(skill){previewSkill(skill.dataset.skill);return}
 const tab=event.target.closest("[data-skill-tab]");
 if(tab){currentSkillTab=tab.dataset.skillTab;refreshSkillPreview();return}
 const sample=event.target.closest("[data-sample]");
 if(sample){currentResult=sample.dataset.sample;refreshSkillPreview();return}
 const f=event.target.closest("[data-skill-file]");
 if(f){currentFile=f.dataset.skillFile;showFileSource=false;refreshSkillPreview();return}
 if(event.target.closest("[data-file-toggle]")){showFileSource=!showFileSource;refreshSkillPreview();return}
 if(event.target.closest("[data-skill-close]")){$("skill-dialog").close()}
});

document.addEventListener("click",event=>{
 const option=event.target.closest("button[data-prompt-example]");
 if(!option)return;
 const i=Number(option.dataset.promptExample);
 if(!Number.isInteger(i)||!(step().promptExamples||[])[i])return;
 ui.promptChoice=i;
 renderDetails();
});
document.addEventListener("click",async event=>{
  const button=event.target.closest("[data-copy-prompt]");
  if(!button||!ui.data)return;
  const content=activePrompt(step());
  if(!content)return;
  const original=button.textContent;
  try{
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(content);
    }else{
      const area=document.createElement("textarea");
      area.value=content;area.style.position="fixed";area.style.opacity="0";
      document.body.appendChild(area);area.select();
      if(!document.execCommand("copy"))throw Error("复制未成功");
      area.remove();
    }
    button.textContent="✓ 已复制";
  }catch(error){
    button.textContent="复制失败，请手动选中文本";
    console.warn("复制提示词失败",error);
  }
  setTimeout(()=>{if(button.isConnected)button.textContent=original},1800);
});
document.addEventListener("click",event=>{
  const target=event.target.closest("button[data-phase],button[data-step]");
  if(!target)return;
  if(target.dataset.phase)setSelection(target.dataset.phase,null,true);
  else if(target.dataset.step){setSelection(ui.phase,target.dataset.step);if(innerWidth<781)document.querySelector(".detail-pane")?.scrollIntoView({behavior:"smooth",block:"start"});}
});
(async()=>{
 try{
  const res=await fetch("./data/quotation.json",{cache:"no-store"});
  if(!res.ok)throw Error("HTTP "+res.status);
  ui.data=await res.json();
  skillData=JSON.parse(document.getElementById("skill-data").textContent);
  skillData.workspace=skillData.skills.filter(s=>s.category==='workspace');
  if(!Array.isArray(ui.data.phases)||!ui.data.phases.length)throw Error("缺少研发阶段");
  const qs=new URLSearchParams(location.hash.slice(1));
  const p=allPhases().find(p=>p.id===qs.get("phase"))||visiblePhases()[0];
  setSelection(p.id,qs.get("step"));
 }catch(error){
  $("stage-list").innerHTML="";
  $("stage-intro").innerHTML='<div class="error">研发流程加载失败：'+esc(error.message)+'</div>';
  $("step-detail").innerHTML="<p>请检查 GitHub Pages 是否已发布 data/quotation.json。</p>";
  console.error(error);
 }
})();