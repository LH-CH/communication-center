let index=0;
let timer=null;

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

export function startNotices(config){
  clearInterval(timer);
  index=0;
  render(config);
  timer=setInterval(()=>advance(config),10000);
}

function render(config){
  const list=activeNotices(config);
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
  requestAnimationFrame(()=>position());
  count.textContent=list.length>1?`${index+1} of ${list.length}`:'';
  exp.textContent=formatExpiration(list[index]?.expires,config.timeZone||'America/Denver');
}

function position(){
  const track=document.getElementById('noticeTrack');
  const items=[...track.querySelectorAll('.notice-item')];
  if(!items.length)return;
  const active=items[index];
  items.forEach((el,i)=>el.classList.toggle('active',i===index));
  const offset=-(active.offsetTop+active.offsetHeight/2);
  track.style.setProperty('--notice-offset',`${offset}px`);
}

function advance(config){
  const list=activeNotices(config);
  if(!list.length)return render(config);
  if(document.getElementById('noticeTrack').children.length!==list.length){
    index=0;
    return render(config);
  }
  index=(index+1)%list.length;
  position();
  document.getElementById('noticeCount').textContent=list.length>1?`${index+1} of ${list.length}`:'';
  document.getElementById('noticeExpiration').textContent=formatExpiration(list[index]?.expires,config.timeZone||'America/Denver');
}
