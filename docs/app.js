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
function flowDiagram(items){
  if(!items?.length)return '<p>此Skill尚未配置流程图。</p>';
  const width=640,nodeX=112,nodeWidth=416,nodeHeight=58,gap=42,ys=items.map((_,i)=>20+i*(nodeHeight+gap));
  const h=ys.at(-1)+nodeHeight+95;
  let svg='<svg class="skill-flow-svg" viewBox="0 0 '+width+' '+h+'" role="img" aria-label="Skill内部执行流程图"><defs><marker id="skill-arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#7291ba"/></marker></defs>';
  for(let i=0;i<items.length;i++){
    let y=ys[i],txt=items[i],mid=y+nodeHeight/2;
    const a=Array.from(txt);const lines=[];
    for(let j=0;j<a.length;j+=19)lines.push(a.slice(j,j+19).join(""));
    svg+='<rect x="'+nodeX+'" y="'+y+'" rx="10" width="'+nodeWidth+'" height="'+nodeHeight+'" fill="'+(i===0?"#e7efff":"#f3f6fb")+'" stroke="#86a5d0" stroke-width="1.5"/>';
    lines.slice(0,2).forEach((line,j)=>svg+='<text x="'+width/2+'" y="'+(mid-(Math.min(lines.length,2)-1)*10+j*20)+'" font-size="15" text-anchor="middle" dominant-baseline="middle" fill="#2c4b70">'+esc(line)+'</text>');
    if(i>0){svg+='<path d="M320 '+(ys[i-1]+nodeHeight)+' V'+(y-4)+'" fill="none" stroke="#7291ba" stroke-width="2" marker-end="url(#skill-arr)"/>'}
  }
  const dy=ys.at(-1)+nodeHeight+25;
  svg+='<path d="M320 '+(ys.at(-1)+nodeHeight)+' V'+(dy-5)+'" fill="none" stroke="#7291ba" stroke-width="2" marker-end="url(#skill-arr)"/>';
  svg+='<rect x="208" y="'+dy+'" width="224" height="45" rx="22" fill="#e1f2e8" stroke="#8ab89e"/><text x="320" y="'+(dy+28)+'" font-size="14" text-anchor="middle" fill="#256344">审核 / 输出 / 通过</text></svg>';
  return '<div class="skill-flow-wrapper">'+svg+'</div><p class="flow-note">每一步必须基于真实文件或验证证据；未通过审核退回相关环节，不能直接宣布完成。</p>';
}
function markdownPreview(md){return '<pre class="skill-markdown">'+esc(md||"暂未提供该类型的内容。")+'</pre>'}
function previewSkill(id){
 const item=skillData?.skills?.find(x=>x.id===id);
 if(!item)return;
 currentSkill=item;currentSkillTab="flow";
 $("skill-dialog-title").textContent=id;
 $("skill-dialog-label").textContent=item.type+" · "+item.stepTitle;
 refreshSkillPreview();
 const dlg=$("skill-dialog");if(!dlg.open)dlg.showModal();
}
function refreshSkillPreview(){
 const sk=currentSkill;if(!sk)return;
 const tabs=[...document.querySelectorAll("[data-skill-tab]")];
 tabs.forEach(t=>{const active=t.dataset.skillTab===currentSkillTab;t.classList.toggle("active",active);t.setAttribute("aria-selected",String(active))});
 let content="";
 if(currentSkillTab==="flow")content=flowDiagram(sk.flow);
 else if(currentSkillTab==="content")content=markdownPreview(sk.content);
 else if(currentSkillTab==="example")content=markdownPreview(sk.example||"Matt原版Skill未单独附带本项目示例；原版正文保持不变，可结合右侧步骤提示词使用。");
 else content=markdownPreview(sk.template||"Matt原版Skill的模板按官方SKILL.md内容执行，未覆盖或复制上游额外资源。");
 $("skill-dialog-content").innerHTML=content;
 const a=sk.source;
 $("skill-reference").innerHTML='参考：<a href="'+esc(a.url)+'" target="_blank" rel="noopener noreferrer">'+esc(a.repo)+'</a> · '+esc(a.path);
}
document.addEventListener("click",event=>{
 const skill=event.target.closest("[data-skill]");
 if(skill){previewSkill(skill.dataset.skill);return}
 const tab=event.target.closest("[data-skill-tab]");
 if(tab){currentSkillTab=tab.dataset.skillTab;refreshSkillPreview();return}
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