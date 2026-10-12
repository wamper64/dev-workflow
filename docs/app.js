const ui={data:null,phase:"P01",step:"S01"};
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toolkitPhase=()=>({
 id:"PTOOLS",
 title:"通用 Skills",
 kind:"toolkit",
 owner:"按需使用的开发人员、项目经理或技术总监",
 description:"贯穿所有研发阶段的辅助能力。选择 Skill 后查看用途、调用时机和完整文件；它们不是强制研发步骤，也不改变主流程的先后顺序。",
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
   prompt:"请调用 Matt 官方 Skill：/"+w.id+"（skills/"+w.id+"/SKILL.md）。"+w.summary+"。请先读取该Skill的全部适用文件，并依据当前项目的真实上下文执行，不把工具调用误作必经项目步骤。",
   source:w.source?.url||""
 }))
});
const allPhases=()=>[...ui.data.phases,toolkitPhase()];
const phase=()=>allPhases().find(p=>p.id===ui.phase)||ui.data.phases[0];
const step=()=>phase().steps.find(s=>s.id===ui.step)||phase().steps[0];
const kind=k=>k==="toolkit"?"跨阶段可调用":k==="prep"?"仅展示初始输入":k==="repeat"?"按模块循环":k==="final"?"整体验收与交付":"项目建设阶段";
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
const skillList=skills=>!(skills||[]).length?'<div class="review-box">这里只展示已有输入，无需调用Skill。</div>':'<div class="skill-grid">'+(skills||[]).map(id=>{const sk=ui.data.skills.find(x=>x.id===id)||skillData?.workspace.find(x=>x.id===id);const origin=sk?.origin||sk?.type||"待核实";return '<button type="button" class="skill-pill '+(origin==="Matt原版"?"":"custom")+'" data-skill="'+esc(id)+'" title="点击查看SKILL.md、逻辑流程、示例与模板">'+esc(id)+' <span class="skill-kind">'+esc(origin)+'</span> ↗</button>'}).join("")+'</div>';
function renderStages(){
  $("project-stats").textContent=ui.data.phases.length+" 个阶段 · "+ui.data.phases.reduce((n,p)=>n+p.steps.length,0)+" 个步骤 · "+(skillData?.workspace.length||0)+" 个通用Skill";
  $("stage-list").innerHTML=ui.data.phases.map((p,i)=>
    '<button type="button" class="stage-item '+(p.id===ui.phase?"active":"")+'" data-phase="'+esc(p.id)+'" aria-current="'+(p.id===ui.phase?"step":"false")+'"><span class="stage-index">'+String(i).padStart(2,"0")+'</span><span class="stage-body"><span class="stage-title">'+esc(p.title)+'</span><span class="stage-meta">'+p.steps.length+' 个步骤'+(p.kind==="repeat"?" · 循环":"")+'</span></span><span class="stage-arrow" aria-hidden="true">›</span></button>'
  ).join("")+'<div class="stage-toolkit-separator" role="separator">跨阶段工具</div>'+
  '<button type="button" class="stage-item stage-toolkit '+(ui.phase==="PTOOLS"?"active":"")+'" data-phase="PTOOLS" aria-current="'+(ui.phase==="PTOOLS"?"step":"false")+'"><span class="stage-index">✦</span><span class="stage-body"><span class="stage-title">通用 Skills</span><span class="stage-meta">'+(skillData?.workspace.length||0)+' 个 · 随时使用</span></span><span class="stage-arrow" aria-hidden="true">›</span></button>';
}
function renderSteps(){
  const p=phase(),i=ui.data.phases.indexOf(p)+1;
  $("stage-intro").innerHTML='<h1>'+esc(p.title)+'</h1><p class="stage-desc">'+esc(p.description)+'</p><span class="stage-type">'+kind(p.kind)+'</span>';
  const route=p.id==="P01"?"输入读取与检查 → Matt初始化 → 项目基线 → <b>整体架构（内置Grill）</b> → 数据库总体 → 开发环境 → 模块拆分":p.id==="P02"?"<b>选本轮任务 + 依赖校验 + 详细设计（Grill）</b> → Spec → Tickets → <b>Matt原版implement-spec</b> → <b>人工测试 manual-testing：生成→人工执行回填→签收</b> → 按需Bug修复 → <b>Matt原版retro</b> → 下一轮":p.id==="P03"?"项目级验收 → 上线评审 → 预演与回滚 → 正式上线":p.kind==="toolkit"?"按任务需要选择合适的通用工具":"已确认需求基线 + docs/input/ + code/";
  const routeEl=$("phase-route"); if(routeEl)routeEl.innerHTML=route.split(" → ").map(x=>'<span class="route-chip">'+x+'</span>').join('<span class="route-arrow">→</span>');
  $("step-count").textContent=p.kind==="toolkit"?p.steps.length+" 个通用Skill":p.steps.length+" 项工作";
 $("step-heading-title").textContent=p.kind==="toolkit"?"通用 Skill 列表":"执行步骤";
  $("step-list").innerHTML=p.steps.map((s,k)=>
    '<button type="button" class="step-item '+(s.id===ui.step?"active":"")+'" data-step="'+esc(s.id)+'" aria-current="'+(s.id===ui.step?"step":"false")+'"><span class="step-index">'+(k+1)+'</span><span class="step-body"><strong>'+esc(s.title)+'</strong><small>'+(p.kind==="toolkit"?esc("/"+s.skillId)+" · 按需调用":"阶段 "+i+" · "+s.id)+'</small></span><span class="step-chevron" aria-hidden="true">›</span></button>'
  ).join("");
}

// 用户填入的是开发环境的事实，而不是AI推断结果；只缓存本浏览器非敏感字段
function renderDetails(){
  const p=phase(),s=step(),index=p.steps.indexOf(s)+1;
  if(p.kind==="toolkit"){
    $("step-position").textContent="通用 "+String(index).padStart(2,"0")+" / "+String(p.steps.length).padStart(2,"0");
    let content='<h2>'+esc(s.title)+'</h2><p class="step-context">跨阶段通用工具 · /'+esc(s.skillId)+'</p>';
    content+='<section class="detail-section"><h3><span class="section-icon">◇</span> 查看完整 Skill</h3>'+skillList(s.skills)+'</section>';
    content+='<section class="detail-section"><h3><span class="section-icon">◎</span> 用途与调用时机</h3><div class="review-box">'+esc(s.summary)+'</div><p class="owner">按实际任务需要调用，不要求每个阶段都执行。</p></section>';
    content+='<section class="detail-section"><h3><span class="section-icon">↘</span> 使用上下文</h3>'+fileList([s.input])+'</section>';
    content+='<section class="detail-section"><h3><span class="section-icon">↗</span> 可能的结果</h3>'+fileList([s.output])+'</section>';
    content+='<section class="detail-section"><h3><span class="section-icon">✓</span> 核心执行方式</h3><div class="toolkit-steps">'+s.workflow.map((t,i)=>'<div class="toolkit-activity"><span>'+String(i+1)+'</span><p>'+esc(t)+'</p></div>').join("")+'</div><p class="detail-hint">适用边界：'+esc(s.limitation)+'</p></section>';
    content+='<section class="detail-section prompt-section"><div class="prompt-heading"><h3><span class="section-icon">✎</span> 调用提示词</h3><button type="button" class="copy-prompt" data-copy-prompt>复制提示词</button></div><div class="prompt-text">'+esc(s.prompt)+'</div></section>';
    $("step-detail").innerHTML=content;return;
  }
  $("step-position").textContent=String(index).padStart(2,"0")+" / "+String(p.steps.length).padStart(2,"0");
  let html='<h2>'+esc(s.title)+'</h2><p class="step-context">'+esc(p.title)+' · '+esc(s.id)+'</p>';
  
  if((s.skills||[]).length)html+='<section class="detail-section"><h3><span class="section-icon">◇</span> 使用的 Skill</h3>'+skillList(s.skills)+'</section>';
  else html+='<section class="detail-section"><h3><span class="section-icon">◎</span> 执行方式</h3><div class="review-box">'+(s.id==="S01"?"使用下方提示词直接读取并校验输入，无需安装Skill。":s.id==="S14H"?"人工执行上一步生成的用例，填写真实结果；无独立Skill。":"此步骤仅展示已有输入，不调用Skill。")+'</div></section>';
  if(Array.isArray(s.invokes)&&s.invokes.length){html+='<section class="detail-section"><h3><span class="section-icon">↳</span> 主Skill内部引用</h3><p class="detail-hint">以下原版Skill由当前主Skill内部执行，不另占必经步骤；点击可查看完整原版内容。</p>'+skillList(s.invokes)+'</section>';}
  html+='<section class="detail-section"><h3><span class="section-icon">↘</span> 输入文件 / 资料</h3>'+fileList(s.inputs)+'</section>';
  html+='<section class="detail-section"><h3><span class="section-icon">↗</span> 输出文件 / 产物</h3>'+fileList(s.outputs)+'</section>';
  html+='<section class="detail-section"><h3><span class="section-icon">✓</span> 审核要求</h3><div class="review-box">'+esc(s.review)+'</div><p class="owner">审核及参与角色：'+esc(p.owner)+'</p></section>';
  if(p.id!=="P00"&&s.prompt){html+='<section class="detail-section prompt-section"><div class="prompt-heading"><h3><span class="section-icon">✎</span> 执行提示词</h3><button type="button" class="copy-prompt" data-copy-prompt aria-label="复制当前步骤提示词">复制提示词</button></div><div class="prompt-text">'+esc(s.prompt||"执行提示词待确认")+'</div><p class="detail-hint">提示词引用本步骤唯一主Skill，执行前仍需读取真实输入并进行必要验证。</p></section>';}
  if(p.id==="P01"&&s.id==="S07"&&ui.data.modules?.length){
    html+='<details class="extra-disclosure"><summary>查看本项目13个候选模块与菜单映射</summary>';
    html+=ui.data.modules.map(m=>'<div class="module-record"><b>'+esc(m.id+" · "+m.title)+'</b><p>'+esc([...m.menus,...(m.additional?[m.additional]:[])].join("、"))+'</p></div>').join("");
    html+='</details>';
  }
  if(p.id==="P02"){html+='<details class="extra-disclosure"><summary>查看本轮完整模块开发闭环</summary>'+ui.data.iterationFlow.map((it,i)=>'<div class="module-record"><b>'+(i+1)+'. '+esc(it.title)+'</b></div>').join("")+'</details>';}
  $("step-detail").innerHTML=html;
}
function setSelection(phaseId,stepId,moveFocus=false){
  const next=allPhases().find(p=>p.id===phaseId);
  if(!next)return;
  ui.phase=next.id;
  ui.step=next.steps.some(s=>s.id===stepId)?stepId:next.steps[0].id;
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
 const gate=f.gate||{};
 return '<section class="quick-route"><div class="skill-overview-title"><h3>'+esc(f.title||"Skill执行流程")+'</h3><span>顺序与退回路径</span></div><div class="quick-route-track">'+nodes+'</div>'
 +'<div class="quick-route-gate"><b>审核关口：</b>'+esc(gate.question||"")+'</div><div class="quick-route-branch"><p><b>✓ 通过</b>'+esc(gate.pass||"")+'</p><p><b>↶ 未通过</b>'+esc(gate.fail||"")+'</p></div></section>';
}
function renderSkillCoverage(a){
 const items=a.coverage||[];
 if(!items.length)return "";
 const entries=items.map((x,i)=>'<div class="quick-coverage-row"><div class="quick-coverage-name"><small>'+String(i+1).padStart(2,"0")+'</small><b>'+esc(x.title)+'</b></div><div><em>必须包含</em>'+esc(x.must)+'</div><div><em>应有产物</em>'+esc(x.evidence)+'</div><div class="quick-coverage-risk"><em>缺失信号</em>'+esc(x.gap)+'</div></div>').join("");
 return '<section class="quick-coverage"><div class="skill-overview-title"><h3>内容覆盖速查：缺什么一眼可见</h3><span>'+items.length+'个核对维度</span></div><p class="quick-coverage-note">'+esc(a.coverageNote||"这里展示应有内容，并不表示实际已完成。")+'</p><div class="quick-coverage-grid"><div class="quick-coverage-header"><b>维度</b><b>必须明确的具体项</b><b>产物/证据</b><b>常见遗漏</b></div>'+entries+'</div></section>';
}
function renderSkillOverview(skill){
 const a=skill.overview;
 if(!a)return skill.reviewAxes?renderCodeReviewAxes(skill):logicDiagram(skill.diagram);
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
 return '<div class="skill-overview"><div class="skill-summary"><span>一句话理解</span><h3>'+esc(a.headline)+'</h3><p>'+esc(a.why)+'</p><div class="skill-summary-output"><b>交付产物</b> '+esc(a.result)+'</div></div>'
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

document.addEventListener("click",async event=>{
  const button=event.target.closest("[data-copy-prompt]");
  if(!button||!ui.data)return;
  const content=step().prompt||"";
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
  const p=allPhases().find(p=>p.id===qs.get("phase"))||ui.data.phases[0];
  setSelection(p.id,qs.get("step"));
 }catch(error){
  $("stage-list").innerHTML="";
  $("stage-intro").innerHTML='<div class="error">研发流程加载失败：'+esc(error.message)+'</div>';
  $("step-detail").innerHTML="<p>请检查 GitHub Pages 是否已发布 data/quotation.json。</p>";
  console.error(error);
 }
})();