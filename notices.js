let index=0;
let rotationTimer=null;
let boundaryTimer=null;
let currentConfig={};

const escapeHtml=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

export function activeNotices(config){
  if(config.showNoticeManager===false)return[];
  const now=Date.now();
  const rank={urgent:0,important:1,normal:2};
  return (config.notices||[])
    .filter(n=>n?.message?.trim()&&(!n.start||new Date(n.start).getTime()<=now)&&(!n.expires||new Date(n.expires).getTime()>now))
    .sort((a,b)=>(rank[a.priority||'normal']??2)-(rank[b.priority||'normal']??2));
}

export function formatExpiration(value,timeZone){
  if(!value)return'';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return'';
  const today=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const target=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  const time=new Intl.DateTimeFormat('en-US',{timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);
  if(today===target)return`Expires ${time}`;
  const date=new Intl.DateTimeFormat('en-US',{timeZone,month:'short',day:'numeric'}).format(d);
  return`Expires ${date} · ${time}`;
}

function displayMs(n){
  const len=(n?.message||'').length;
  const reading=7000+Math.ceil(len/40)*1800;
  const urgent=(n?.priority==='urgent')?3500:(n?.priority==='important'?1500:0);
  return Math.max(8000,Math.min(26000,reading+urgent));
}

function nextBoundary(config){
  const now=Date.now();
  const times=[];
  for(const n of config.notices||[]){
    for(const k of ['start','expires']){
      if(!n[k])continue;
      const t=new Date(n[k]).getTime();
      if(Number.isFinite(t)&&t>now)times.push(t);
    }
  }
  return times.length?Math.min(...times):null;
}

export function startNotices(config){
  currentConfig=config||{};
  clearTimeout(rotationTimer);
  clearTimeout(boundaryTimer);
  index=0;
  render();
  scheduleRotation();
  scheduleBoundary();
}

export function repositionNotices(){
  requestAnimationFrame(position);
}

function scheduleRotation(){
  clearTimeout(rotationTimer);
  const list=activeNotices(currentConfig);
  if(list.length<=1)return;
  const active=list[Math.min(index,list.length-1)];
  rotationTimer=setTimeout(()=>{
    advance();
    scheduleRotation();
  },displayMs(active));
}

function scheduleBoundary(){
  clearTimeout(boundaryTimer);
  const next=nextBoundary(currentConfig);
  if(!next)return;
  boundaryTimer=setTimeout(()=>{
    index=0;
    render();
    scheduleRotation();
    scheduleBoundary();
  },Math.max(250,next-Date.now()+100));
}

function fitNotice(el){
  if(!el)return;
  el.style.fontSize='';
  const min=14;
  let size=parseFloat(getComputedStyle(el).fontSize);
  while(size>min&&(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)){
    size-=1;
    el.style.fontSize=`${size}px`;
  }
}

function render(){
  const list=activeNotices(currentConfig);
  const banner=document.getElementById('noticeBanner');
  const track=document.getElementById('noticeTrack');
  const count=document.getElementById('noticeCount');
  const exp=document.getElementById('noticeExpiration');

  if(!list.length){
    banner.classList.remove('active');
    track.innerHTML='';
    count.textContent='';
    exp.textContent='';
    return;
  }

  index=Math.min(index,list.length-1);
  banner.classList.add('active');
  track.innerHTML=list.map((n,i)=>`<div class="notice-item ${escapeHtml(n.priority||'normal')} ${i===index?'active':''}" data-index="${i}">${escapeHtml(n.message)}</div>`).join('');
  requestAnimationFrame(()=>{
    position();
    fitNotice(track.querySelector('.notice-item.active'));
  });
  count.textContent=list.length>1?`${index+1} of ${list.length}`:'';
  exp.textContent=formatExpiration(list[index]?.expires,currentConfig.timeZone||'America/Denver');
}

function position(){
  const track=document.getElementById('noticeTrack');
  const items=[...track.querySelectorAll('.notice-item')];
  if(!items.length)return;
  index=Math.min(index,items.length-1);
  const active=items[index];
  items.forEach((el,i)=>el.classList.toggle('active',i===index));
  const offset=-(active.offsetTop+active.offsetHeight/2);
  track.style.setProperty('--notice-offset',`${offset}px`);
}

function advance(){
  const list=activeNotices(currentConfig);
  if(!list.length)return render();
  if(document.getElementById('noticeTrack').children.length!==list.length){
    index=0;
    return render();
  }
  index=(index+1)%list.length;
  position();
  const active=document.querySelector('.notice-item.active');
  fitNotice(active);
  document.getElementById('noticeCount').textContent=list.length>1?`${index+1} of ${list.length}`:'';
  document.getElementById('noticeExpiration').textContent=formatExpiration(list[index]?.expires,currentConfig.timeZone||'America/Denver');
}
