const $=id=>document.getElementById(id);
const TOKEN_SESSION='displayAdminToken';
const TOKEN_PERSIST='displayAdminTokenPersistent';
const REMEMBER='displayAdminRememberAccess';

let currentSha='',currentConfig={},notices=[],selectedLocation=null,locations=[];

const enc=s=>btoa(unescape(encodeURIComponent(s)));
const dec=s=>decodeURIComponent(escape(atob(s.replace(/\n/g,''))));
const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function apiUrl(){
  const path=$('path').value.trim().split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${encodeURIComponent($('owner').value.trim())}/${encodeURIComponent($('repo').value.trim())}/contents/${path}?ref=${encodeURIComponent($('branch').value.trim())}`;
}
function headers(){
  const h={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  const token=$('token').value.trim();
  if(token)h.Authorization=`Bearer ${token}`;
  return h;
}
function persistAccess(){
  const token=$('token').value.trim(),remember=$('rememberAccess').checked;
  if(remember){
    localStorage.setItem(REMEMBER,'true');
    localStorage.setItem(TOKEN_PERSIST,token);
    sessionStorage.removeItem(TOKEN_SESSION);
  }else{
    localStorage.removeItem(REMEMBER);localStorage.removeItem(TOKEN_PERSIST);
    if(token)sessionStorage.setItem(TOKEN_SESSION,token);
  }
}
function restoreAccess(){
  const remember=localStorage.getItem(REMEMBER)==='true';
  $('rememberAccess').checked=remember;
  $('token').value=remember?(localStorage.getItem(TOKEN_PERSIST)||''):(sessionStorage.getItem(TOKEN_SESSION)||'');
}
function setLocation(loc){
  selectedLocation={label:loc.label,latitude:Number(loc.latitude),longitude:Number(loc.longitude),timeZone:loc.timeZone||'America/Denver'};
  $('selectedLocationLabel').textContent=selectedLocation.label;
  $('selectedLocationMeta').textContent=selectedLocation.timeZone;
  $('selectedLocation').classList.remove('hidden');
  $('locationEditor').classList.add('hidden');
}
async function loadLocations(){
  try{
    const r=await fetch(`locations.json?v=${Date.now()}`,{cache:'no-store'});
    locations=await r.json();
  }catch{locations=[]}
}
function searchLocations(q){
  const term=q.trim().toLowerCase(),root=$('locationResults');
  root.innerHTML='';
  if(term.length<2)return;
  locations.filter(x=>[x.label,x.city,x.state,x.zip].filter(Boolean).join(' ').toLowerCase().includes(term)).slice(0,8).forEach(x=>{
    const b=document.createElement('button');b.className='location-option';
    b.innerHTML=`<strong>${esc(x.label)}</strong><small>${esc([x.zip,x.timeZone].filter(Boolean).join(' · '))}</small>`;
    b.onclick=()=>setLocation(x);root.appendChild(b);
  });
}
function toLocal(v){
  if(!v)return'';
  const d=new Date(v);if(Number.isNaN(d.getTime()))return'';
  const p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fromLocal(v){return v?new Date(v).toISOString():''}
function renderNotices(){
  const root=$('noticeList');root.innerHTML='';
  $('noticeDisabled').classList.toggle('hidden',$('showNoticeManager').checked);
  root.classList.toggle('hidden',!$('showNoticeManager').checked);
  $('addNoticeBtn').classList.toggle('hidden',!$('showNoticeManager').checked);
  if(!$('showNoticeManager').checked)return;
  if(!notices.length){root.innerHTML='<p style="color:#9eb0c3">No notices configured.</p>';return}
  notices.forEach((n,i)=>{
    const card=document.createElement('div');card.className='notice-card';
    card.innerHTML=`<div class="notice-card-head"><strong>Notice ${i+1}</strong><button data-remove="${i}">Remove</button></div>
    <div class="notice-grid">
      <label class="full">Message<textarea data-i="${i}" data-f="message"></textarea></label>
      <label>Priority<select data-i="${i}" data-f="priority"><option>normal</option><option>important</option><option>urgent</option></select></label>
      <label>Start<input type="datetime-local" data-i="${i}" data-f="start"></label>
      <label>Expiration<input type="datetime-local" data-i="${i}" data-f="expires"></label>
    </div>`;
    root.appendChild(card);
    card.querySelector('[data-f="message"]').value=n.message||'';
    card.querySelector('[data-f="priority"]').value=n.priority||'normal';
    card.querySelector('[data-f="start"]').value=toLocal(n.start);
    card.querySelector('[data-f="expires"]').value=toLocal(n.expires);
  });
}
function syncNotices(){
  document.querySelectorAll('[data-f]').forEach(el=>{
    const n=notices[Number(el.dataset.i)],f=el.dataset.f;if(!n)return;
    n[f]=(f==='start'||f==='expires')?fromLocal(el.value):el.value;
  });
}
function fill(c){
  currentConfig=c;
  notices=Array.isArray(c.notices)?JSON.parse(JSON.stringify(c.notices)):[];
  setLocation({label:c.location?.label||'',latitude:c.location?.latitude,longitude:c.location?.longitude,timeZone:c.timeZone||'America/Denver'});
  $('youtubeUrl').value=c.youtubeUrl||'';
  $('showVideo').checked=c.showVideo!==false;
  $('showNoticeManager').checked=c.showNoticeManager!==false;
  renderNotices();
}
function build(){
  syncNotices();
  return {
    ...currentConfig,
    timeZone:selectedLocation?.timeZone||'America/Denver',
    location:{label:selectedLocation?.label||'',latitude:selectedLocation?.latitude,longitude:selectedLocation?.longitude},
    youtubeUrl:$('youtubeUrl').value.trim(),
    showVideo:$('showVideo').checked,
    showNoticeManager:$('showNoticeManager').checked,
    notices:notices.filter(n=>n.message?.trim())
  };
}
async function loadConfig(){
  persistAccess();
  try{
    const r=await fetch(apiUrl(),{headers:headers(),cache:'no-store'});
    if(!r.ok)throw new Error(`${r.status} ${await r.text()}`);
    const d=await r.json();currentSha=d.sha;fill(JSON.parse(dec(d.content)));$('connectionStatus').textContent='Connected';
  }catch(e){alert(`Unable to load config.json.\n\n${e.message}`)}
}
async function saveConfig(){
  if(!currentSha)return alert('Load the current configuration first.');
  if(!$('token').value.trim())return alert('GitHub token required.');
  persistAccess();
  const config=build();
  const url=`https://api.github.com/repos/${encodeURIComponent($('owner').value.trim())}/${encodeURIComponent($('repo').value.trim())}/contents/${$('path').value.trim().split('/').map(encodeURIComponent).join('/')}`;
  try{
    const r=await fetch(url,{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({
      message:'Update display configuration',
      content:enc(JSON.stringify(config,null,2)+'\n'),
      sha:currentSha,
      branch:$('branch').value.trim()
    })});
    if(!r.ok)throw new Error(`${r.status} ${await r.text()}`);
    const d=await r.json();currentSha=d.content.sha;currentConfig=config;alert('Saved to GitHub.');
  }catch(e){alert(`Unable to save.\n\n${e.message}`)}
}

$('repoToggle').onclick=()=>{const open=$('repoToggle').getAttribute('aria-expanded')==='true';$('repoToggle').setAttribute('aria-expanded',String(!open));$('repoToggle').textContent=open?'+':'−';$('repoSection').classList.toggle('collapsed',open)}
$('rememberAccess').onchange=persistAccess;
$('forgetBtn').onclick=()=>{sessionStorage.removeItem(TOKEN_SESSION);localStorage.removeItem(TOKEN_PERSIST);localStorage.removeItem(REMEMBER);$('token').value='';$('rememberAccess').checked=false}
$('loadBtn').onclick=loadConfig;
$('saveBtn').onclick=saveConfig;
$('previewBtn').onclick=()=>alert(JSON.stringify(build(),null,2));
$('changeLocationBtn').onclick=()=>{$('selectedLocation').classList.add('hidden');$('locationEditor').classList.remove('hidden');$('locationSearch').focus()}
$('locationSearch').oninput=e=>searchLocations(e.target.value);
$('manualLocationBtn').onclick=()=>{$('manualLocationPanel').classList.remove('hidden');$('manualLocationLabel').value=$('locationSearch').value}
$('cancelManualLocationBtn').onclick=()=>$('manualLocationPanel').classList.add('hidden');
$('applyManualLocationBtn').onclick=()=>setLocation({
  label:$('manualLocationLabel').value.trim(),
  latitude:Number($('manualLatitude').value),
  longitude:Number($('manualLongitude').value),
  timeZone:$('manualTimeZone').value
});
$('showNoticeManager').onchange=renderNotices;
$('addNoticeBtn').onclick=()=>{syncNotices();notices.push({message:'',priority:'normal',start:'',expires:''});renderNotices()}
$('noticeList').onclick=e=>{const b=e.target.closest('[data-remove]');if(!b)return;syncNotices();notices.splice(Number(b.dataset.remove),1);renderNotices()};

restoreAccess();
await loadLocations();
