const ui={data:null,phase:"P01",step:"S01"};
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const phase=()=>ui.data.phases.find(p=>p.id===ui.phase)||ui.data.phases[0];
const step=()=>phase().steps.find(s=>s.id===ui.step)||phase().steps[0];
const kind=k=>k==="prep"?"仅展示初始输入":k==="repeat"?"按模块循环":k==="final"?"整体验收与交付":"项目建设阶段";
const fileList=files=>'<div class="file-list">'+(files||[]).map(f=>'<code class="file-item">'+esc(f.trim())+'</code>').join("")+'</div>';
const skillList=skills=>!(skills||[]).length?'<div class="review-box">这里只展示已有输入，无需调用Skill。</div>':'<div class="skill-grid">'+(skills||[]).map(id=>{const sk=ui.data.skills.find(x=>x.id===id);const origin=sk?.origin||"待核实";return '<button type="button" class="skill-pill '+(origin==="Matt原版"?"":"custom")+'" data-skill="'+esc(id)+'" title="点击查看SKILL.md、逻辑流程、示例与模板">'+esc(id)+' <span class="skill-kind">'+esc(origin)+'</span> ↗</button>'}).join("")+'</div>';
function renderStages(){
  $("project-stats").textContent=ui.data.phases.length+" 个阶段 · "+ui.data.phases.reduce((n,p)=>n+p.steps.length,0)+" 个步骤";
  $("stage-list").innerHTML=ui.data.phases.map((p,i)=>
    '<button type="button" class="stage-item '+(p.id===ui.phase?"active":"")+'" data-phase="'+esc(p.id)+'" aria-current="'+(p.id===ui.phase?"step":"false")+'"><span class="stage-index">'+String(i).padStart(2,"0")+'</span><span class="stage-body"><span class="stage-title">'+esc(p.title)+'</span><span class="stage-meta">'+p.steps.length+' 个步骤'+(p.kind==="repeat"?" · 循环":"")+'</span></span><span class="stage-arrow" aria-hidden="true">›</span></button>'
  ).join("");
}
function renderSteps(){
  const p=phase(),i=ui.data.phases.indexOf(p)+1;
  $("stage-intro").innerHTML='<h1>'+esc(p.title)+'</h1><p class="stage-desc">'+esc(p.description)+'</p><span class="stage-type">'+kind(p.kind)+'</span>';
  $("step-count").textContent=p.steps.length+" 项工作";
  $("step-list").innerHTML=p.steps.map((s,k)=>
    '<button type="button" class="step-item '+(s.id===ui.step?"active":"")+'" data-step="'+esc(s.id)+'" aria-current="'+(s.id===ui.step?"step":"false")+'"><span class="step-index">'+(k+1)+'</span><span class="step-body"><strong>'+esc(s.title)+'</strong><small>阶段 '+i+' · '+s.id+'</small></span><span class="step-chevron" aria-hidden="true">›</span></button>'
  ).join("");
}
function renderDetails(){
  const p=phase(),s=step(),index=p.steps.indexOf(s)+1;
  $("step-position").textContent=String(index).padStart(2,"0")+" / "+String(p.steps.length).padStart(2,"0");
  let html='<h2>'+esc(s.title)+'</h2><p class="step-context">'+esc(p.title)+' · '+esc(s.id)+'</p>';
  html+='<section class="detail-section"><h3><span class="section-icon">◇</span> 使用的 Skill</h3>'+skillList(s.skills)+'</section>';
  html+='<section class="detail-section"><h3><span class="section-icon">↘</span> 输入文件 / 资料</h3>'+fileList(s.inputs)+'</section>';
  html+='<section class="detail-section"><h3><span class="section-icon">↗</span> 输出文件 / 产物</h3>'+fileList(s.outputs)+'</section>';
  html+='<section class="detail-section"><h3><span class="section-icon">✓</span> 审核要求</h3><div class="review-box">'+esc(s.review)+'</div><p class="owner">审核及参与角色：'+esc(p.owner)+'</p></section>';
  if(p.id!=="P00"){html+='<section class="detail-section prompt-section"><div class="prompt-heading"><h3><span class="section-icon">✎</span> 执行提示词</h3><button type="button" class="copy-prompt" data-copy-prompt aria-label="复制当前步骤提示词">复制提示词</button></div><div class="prompt-text">'+esc(s.prompt||"执行提示词待确认")+'</div><p class="detail-hint">提示词引用本步骤唯一主Skill，执行前仍需读取真实输入并进行必要验证。</p></section>';}
  if(p.id==="P01"&&s.id==="S07"){
    html+='<details class="extra-disclosure"><summary>查看本项目13个候选模块与菜单映射</summary>';
    html+=ui.data.modules.map(m=>'<div class="module-record"><b>'+esc(m.id+" · "+m.title)+'</b><p>'+esc([...m.menus,...(m.additional?[m.additional]:[])].join("、"))+'</p></div>').join("");
    html+='</details>';
  }
  if(p.id==="P02"){html+='<details class="extra-disclosure"><summary>查看本轮8步模块开发循环</summary>'+ui.data.iterationFlow.map((it,i)=>'<div class="module-record"><b>'+(i+1)+'. '+esc(it.title)+'</b></div>').join("")+'</details>';}
  $("step-detail").innerHTML=html;
}
function setSelection(phaseId,stepId,moveFocus=false){
  const next=ui.data.phases.find(p=>p.id===phaseId);
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

function renderSkillOverview(skill){
 const a=skill.overview;
 if(!a)return logicDiagram(skill.diagram);
 const cards=(a.sections||[]).map((x,i)=>'<article class="skill-topic-card"><span class="skill-topic-index">'+String(i+1).padStart(2,"0")+'</span><h4>'+esc(x.title)+'</h4><p>'+esc(x.summary)+'</p><div class="skill-topic-example"><span>报价项目举例</span>'+esc(x.sample)+'</div></article>').join("");
 const conversions=(a.thinking||[]).map(x=>'<div class="thinking-row"><div><span class="thinking-label">资料中有什么</span><p>'+esc(x.given)+'</p></div><span class="thinking-arrow">→</span><div><span class="thinking-label">Skill 提炼什么</span><p>'+esc(x.answer)+'</p></div></div>').join("");
 const exclusions=(a.doesNot||[]).map(x=>'<li>'+esc(x)+'</li>').join("");
 return '<div class="skill-overview"><div class="skill-summary"><span>一句话理解</span><h3>'+esc(a.headline)+'</h3><p>'+esc(a.why)+'</p><div class="skill-summary-output"><b>交付产物</b> '+esc(a.result)+'</div></div>'
 +'<div class="skill-overview-title"><h3>工程基线具体有哪些内容？</h3><span>7个核心板块</span></div><div class="skill-topic-grid">'+cards+'</div>'
 +'<div class="skill-overview-title"><h3>资料与工程约束如何转化？</h3></div><div class="thinking-grid">'+conversions+'</div>'
 +'<div class="skill-overview-title"><h3>本 Skill 不处理的内容</h3></div><ul class="skill-exclusions">'+exclusions+'</ul>'
 +'<div class="skill-cta"><span>先看输出效果，再决定是否细读SKILL.md</span><button type="button" data-skill-tab="result">查看报价项目完整输出示例 →</button></div></div>';
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
 if(!selected||!s.files?.[selected])return '<p class="sample-empty">当前还没有经过审核的完整产物示例。</p>';
 return '<div class="sample-head"><div><strong>报价系统工程基线——示范执行结果</strong><p>这是模拟输入及模拟裁定的成品形态，并非已运行真实客户PRD生成的正式基线。</p></div><div class="sample-actions"><button data-sample="final" class="'+(currentResult==="final"?"active":"")+'">工程基线成品</button>'+(s.consultationFile?'<button data-sample="consultation" class="'+(currentResult==="consultation"?"active":"")+'">AI澄清过程</button>':"")+'</div></div>'
 +renderSampleMarkdown(s.files[selected]);
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
 +'<div class="research-rows">'+rs.map(x=>'<article class="research-row"><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">查看参考原文 ↗</a><p>'+esc(x.learned)+'</p></article>').join("")+'</div>'
 +(!rs.length?'<p>暂无足够的逐项研究笔记，需要继续核实原始Skill文件，不能只凭仓库名称声称已参考。</p>':"")
 +'<p class="research-boundary">Matt原版保持不改；自建/改造说明只在网站中展示。</p></div>';
}
function renderWorkspace(){
 const list=skillData?.workspace||[];
 $("workspace-skills").innerHTML=list.map(k=>
  '<button type="button" class="workspace-skill" data-workspace-skill="'+esc(k.id)+'"><strong>'+esc(k.name)+' <code>/'+esc(k.id)+'</code></strong><p>'+esc(k.summary)+'</p><span>查看完整Skill与学习来源 ↗</span></button>'
 ).join("");
}
document.addEventListener("click",event=>{
 if(event.target.closest("#workspace-open")){renderWorkspace();const dlg=$("workspace-dialog");if(!dlg.open)dlg.showModal();return}
 if(event.target.closest("[data-workspace-close]")){$("workspace-dialog").close();return}
 const b=event.target.closest("[data-workspace-skill]");
 if(b){$("workspace-dialog").close();previewSkill(b.dataset.workspaceSkill)}
});

function previewSkill(id){
 const item=skillData?.skills?.find(x=>x.id===id);
 if(!item)return;
 currentSkill=item;currentSkillTab="flow";currentResult="final";currentFile="SKILL.md";showFileSource=false;
 $("skill-dialog-title").textContent=id;
 $("skill-dialog-label").textContent="覆盖步骤："+item.stepTitle+" · 实际文件："+Object.keys(item.files||{}).length+" 个";
 refreshSkillPreview();
 const dlg=$("skill-dialog");if(!dlg.open)dlg.showModal();
}
function refreshSkillPreview(){
 const sk=currentSkill;if(!sk)return;
 document.querySelectorAll(".skill-dialog-tabs [data-skill-tab]").forEach(t=>{if(t.dataset.skillTab==="result")t.hidden=!sk.outputSampleFile;const active=t.dataset.skillTab===currentSkillTab;t.classList.toggle("active",active);t.setAttribute("aria-selected",String(active))});
 let content=currentSkillTab==="flow"?renderSkillOverview(sk):currentSkillTab==="result"?renderSkillResult():currentSkillTab==="files"?renderFiles():renderSkillSources(sk);
 $("skill-dialog-content").innerHTML=content;
 const a=sk.source;
 $("skill-reference").innerHTML='<span>研究来源：</span><a href="'+esc(a.url)+'" target="_blank" rel="noopener noreferrer">'+esc(a.repo)+'</a> <span class="skill-aux">（不属于交付正文）</span>';
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
  const p=ui.data.phases.find(p=>p.id===qs.get("phase"))||ui.data.phases[0];
  setSelection(p.id,qs.get("step"));
 }catch(error){
  $("stage-list").innerHTML="";
  $("stage-intro").innerHTML='<div class="error">研发流程加载失败：'+esc(error.message)+'</div>';
  $("step-detail").innerHTML="<p>请检查 GitHub Pages 是否已发布 data/quotation.json。</p>";
  console.error(error);
 }
})();