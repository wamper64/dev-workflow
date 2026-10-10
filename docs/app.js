const ui={data:null,phase:"P01",step:"S01"};
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const phase=()=>ui.data.phases.find(p=>p.id===ui.phase)||ui.data.phases[0];
const step=()=>phase().steps.find(s=>s.id===ui.step)||phase().steps[0];
const kind=k=>k==="repeat"?"按模块循环":k==="final"?"整体验收与交付":"项目建设阶段";
const fileList=files=>'<div class="file-list">'+(files||[]).map(f=>'<code class="file-item">'+esc(f.trim())+'</code>').join("")+'</div>';
const skillList=skills=>'<div class="skill-grid">'+(skills||[]).map(s=>{const found=ui.data.skills.find(x=>x.id===s);const official=found?.origin==="Matt";return '<span class="skill-pill '+(official?"":"custom")+'" title="'+(official?"Matt Pocock 官方 Skill":"拟自建或辅助 Skill")+'">'+esc(s)+' <span class="skill-kind">'+(official?"Matt":"自建")+'</span></span>'}).join("")+'</div>';
function renderStages(){
  $("project-stats").textContent=ui.data.phases.length+" 个阶段 · "+ui.data.phases.reduce((n,p)=>n+p.steps.length,0)+" 个步骤";
  $("stage-list").innerHTML=ui.data.phases.map((p,i)=>
    '<button type="button" class="stage-item '+(p.id===ui.phase?"active":"")+'" data-phase="'+esc(p.id)+'" aria-current="'+(p.id===ui.phase?"step":"false")+'"><span class="stage-index">'+String(i+1).padStart(2,"0")+'</span><span class="stage-body"><span class="stage-title">'+esc(p.title)+'</span><span class="stage-meta">'+p.steps.length+' 个步骤'+(p.kind==="repeat"?" · 循环":"")+'</span></span><span class="stage-arrow" aria-hidden="true">›</span></button>'
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
  html+='<section class="detail-section prompt-section"><div class="prompt-heading"><h3><span class="section-icon">✎</span> 执行提示词</h3><button type="button" class="copy-prompt" data-copy-prompt aria-label="复制当前步骤提示词">复制提示词</button></div><div class="prompt-text">'+esc(s.prompt||"本步骤尚未配置执行提示词。")+'</div><p class="detail-hint">提示词为启动本步骤的初稿；实施时应先读取实际资料，缺少确认信息不得猜测。</p></section>';
  if(p.id==="P05"){
    html+='<details class="extra-disclosure"><summary>查看本项目13个候选模块与菜单映射</summary>';
    html+=ui.data.modules.map(m=>'<div class="module-record"><b>'+esc(m.id+" · "+m.title)+'</b><p>'+esc([...m.menus,...(m.additional?[m.additional]:[])].join("、"))+'</p></div>').join("");
    html+='</details>';
  }
  if(p.id==="P06"){html+='<details class="extra-disclosure"><summary>查看本轮8步模块开发循环</summary>'+ui.data.iterationFlow.map((it,i)=>'<div class="module-record"><b>'+(i+1)+'. '+esc(it.title)+'</b></div>').join("")+'</details>';}
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