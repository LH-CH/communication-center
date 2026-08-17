import {initMetricIcons,iconFor,getWeather,getCachedWeather,getAlerts,getCachedAlerts} from './weather.js';
import {startNotices,repositionNotices} from './notices.js';

const CONFIG_CACHE='display-config-v3.2';
const $=id=>document.getElementById(id);

let config={};
let configText='';
let weatherTimer,alertsTimer,configTimer,burnTimer;
let videoReadyTimer=null;
let youtubeApiPromise=null;
let youtubePlayer=null;
let burnIndex=0;

const state={
  config:{status:'loading',lastSuccess:null,lastAttempt:null,source:'network'},
  weather:{status:'loading',lastSuccess:null,lastAttempt:null,source:'network'},
  alerts:{status:'loading',lastSuccess:null,lastAttempt:null,source:'network'},
  video:{status:'loading',lastSuccess:null,lastAttempt:null,source:'youtube'},
  configRevision:null,
  configVersion:null,
  configUpdatedAt:null
};

const format24=(d,tz)=>{
  if(!d)return'--:--';
  const date=new Date(d);
  if(Number.isNaN(date.getTime()))return'--:--';
  return new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);
};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function setHealth(name,status){
  state[name].status=status;
  const dot=$(`${name}Dot`);
  if(dot)dot.className=`health-dot ${status==='ok'?'ok':status==='delayed'?'delayed':'error'}`;
  renderDiagnostics();
}
function updateClock(){
  const tz=config.timeZone||'America/Denver';
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const get=t=>parts.find(p=>p.type===t)?.value||'00';
  $('timeMain').textContent=`${get('hour')}:${get('minute')}`;
  $('timeSeconds').textContent=get('second');
  $('dateText').textContent=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(now);
  fitClock();
}
function youtubeId(v=''){
  v=v.trim();
  if(/^[\w-]{11}$/.test(v))return v;
  try{
    const u=new URL(v);
    if(u.hostname.includes('youtu.be'))return u.pathname.split('/').filter(Boolean)[0]||'';
    if(u.pathname.startsWith('/embed/')||u.pathname.startsWith('/live/'))return u.pathname.split('/')[2]||'';
    return u.searchParams.get('v')||'';
  }catch{return''}
}
function showVideoFallback(){
  clearTimeout(videoReadyTimer);
  $('videoFrame').style.display='none';
  $('videoFallback').style.display='flex';
  setHealth('video','error');
}
function showVideoFrame(){
  clearTimeout(videoReadyTimer);
  $('videoFallback').style.display='none';
  $('videoFrame').style.display='block';
  state.video.lastSuccess=new Date().toISOString();
  setHealth('video','ok');
}
function loadYouTubeApi(){
  if(window.YT?.Player)return Promise.resolve();
  if(youtubeApiPromise)return youtubeApiPromise;
  youtubeApiPromise=new Promise((resolve,reject)=>{
    const prior=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      prior?.();
      resolve();
    };
    const s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api';
    s.async=true;
    s.onerror=reject;
    document.head.appendChild(s);
    setTimeout(()=>reject(new Error('YouTube API timeout')),12000);
  });
  return youtubeApiPromise;
}
async function setVideo(){
  const id=youtubeId(config.youtubeUrl||'');
  const frame=$('videoFrame');

  try{youtubePlayer?.destroy?.()}catch{}
  youtubePlayer=null;
  frame.removeAttribute('src');

  if(config.showVideo===false||!id){
    showVideoFallback();
    return;
  }

  state.video.lastAttempt=new Date().toISOString();
  setHealth('video','delayed');
  $('videoFallback').style.display='flex';
  frame.style.display='block';

  videoReadyTimer=setTimeout(showVideoFallback,15000);

  try{
    await loadYouTubeApi();
    youtubePlayer=new YT.Player('videoFrame',{
      videoId:id,
      playerVars:{autoplay:1,mute:1,controls:0,playsinline:1,rel:0,loop:1,playlist:id},
      events:{
        onReady:e=>{
          try{e.target.mute();e.target.playVideo()}catch{}
          showVideoFrame();
        },
        onError:()=>showVideoFallback(),
        onStateChange:e=>{
          if(e.data===YT.PlayerState.PLAYING||e.data===YT.PlayerState.BUFFERING)showVideoFrame();
        }
      }
    });
  }catch(e){
    console.error('YouTube API failed',e);
    showVideoFallback();
  }
}

function solar(date,lat,lon,rise){
  const N=Math.floor((Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())-Date.UTC(date.getUTCFullYear(),0,0))/86400000);
  const lng=lon/15,t=N+((rise?6:18)-lng)/24,M=.9856*t-3.289;
  const L=(M+1.916*Math.sin(M*Math.PI/180)+.020*Math.sin(2*M*Math.PI/180)+282.634+360)%360;
  const RA=(Math.atan(.91764*Math.tan(L*Math.PI/180))*180/Math.PI+360)%360;
  const RAh=(RA+(Math.floor(L/90)*90-Math.floor(RA/90)*90))/15;
  const sinDec=.39782*Math.sin(L*Math.PI/180),cosDec=Math.cos(Math.asin(sinDec));
  const cosH=(Math.cos(90.833*Math.PI/180)-sinDec*Math.sin(lat*Math.PI/180))/(cosDec*Math.cos(lat*Math.PI/180));
  if(Math.abs(cosH)>1)return null;
  const H=(rise?360-Math.acos(cosH)*180/Math.PI:Math.acos(cosH)*180/Math.PI)/15;
  const T=H+RAh-.06571*t-6.622,UT=(T-lng+24)%24;
  return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),Math.floor(UT),Math.round((UT%1)*60)));
}

function renderWeather(w,cached,savedAt){
  $('temperature').textContent=w.tempF==null?'--°F':`${w.tempF}°F`;
  $('condition').textContent=w.description||'Weather unavailable';
  $('weatherIcon').innerHTML=iconFor(w.description||'');
  $('wind').textContent=w.wind||'--';
  $('humidity').textContent=w.humidity==null?'--%':`${Math.round(w.humidity)}%`;

  const stamp=w.updated||savedAt;
  $('updatedText').textContent=`Updated ${stamp?format24(stamp,config.timeZone||'America/Denver'):'--:--'}`;

  const lat=Number(config.location?.latitude),lon=Number(config.location?.longitude);
  if(Number.isFinite(lat)&&Number.isFinite(lon)){
    $('sunrise').textContent=format24(solar(new Date(),lat,lon,true),config.timeZone||'America/Denver');
    $('sunset').textContent=format24(solar(new Date(),lat,lon,false),config.timeZone||'America/Denver');
  }
  fitWeatherText();
}
function renderAlerts(list,cached,savedAt){
  const el=$('alerts');
  if(!list.length){
    el.className='alerts';
    el.innerHTML=`<div class="alert-title">No active weather alerts</div><div class="alert-detail">${cached&&savedAt?`Cached · ${format24(savedAt,config.timeZone||'America/Denver')}`:''}</div>`;
    fitAlertText();
    return;
  }
  const a=list[0],s=(a.severity||'').toLowerCase(),event=(a.event||'').toLowerCase();
  let klass='';
  if(s==='extreme'||s==='severe'||event.includes('warning'))klass='warning';
  else if(event.includes('watch'))klass='watch';
  else if(event.includes('advisory'))klass='advisory';
  el.className=`alerts ${klass}`;
  el.innerHTML=`<div class="alert-title">${a.event||'Weather Alert'}</div><div class="alert-detail">${a.headline||''}${cached?' · Cached':''}</div>`;
  fitAlertText();
}

async function refreshWeather(){
  state.weather.lastAttempt=new Date().toISOString();
  try{
    const r=await getWeather(config);
    renderWeather(r.weather,false,r.savedAt);
    state.weather.lastSuccess=new Date().toISOString();
    state.weather.source='network';
    setHealth('weather','ok');
  }catch(e){
    console.error('Weather refresh failed',e);
    const c=getCachedWeather();
    if(c){
      renderWeather(c.weather,true,c.savedAt);
      state.weather.source='cache';
      setHealth('weather','delayed');
    }else{
      setHealth('weather','error');
    }
  }
}
async function refreshAlerts(){
  state.alerts.lastAttempt=new Date().toISOString();
  try{
    const r=await getAlerts(config);
    renderAlerts(r.alerts,false,r.savedAt);
    state.alerts.lastSuccess=new Date().toISOString();
    state.alerts.source='network';
    setHealth('alerts','ok');
  }catch(e){
    console.error('Alert refresh failed',e);
    const c=getCachedAlerts();
    if(c){
      renderAlerts(c.alerts,true,c.savedAt);
      state.alerts.source='cache';
      setHealth('alerts','delayed');
    }else{
      $('alerts').innerHTML='<div class="alert-title">Weather alerts unavailable</div><div class="alert-detail">No cached alert data</div>';
      setHealth('alerts','error');
    }
  }
}

function saveConfigCache(text){
  try{
    localStorage.setItem(CONFIG_CACHE,JSON.stringify({savedAt:new Date().toISOString(),text}));
  }catch{}
}
function getConfigCache(){
  try{
    const c=JSON.parse(localStorage.getItem(CONFIG_CACHE)||'null');
    return c?.text?c:null;
  }catch{return null}
}
async function fetchConfigWithRetry(){
  let last;
  for(let i=0;i<3;i++){
    state.config.lastAttempt=new Date().toISOString();
    try{
      const r=await fetch(`config.json?v=${Date.now()}`,{cache:'no-store'});
      if(!r.ok)throw new Error(r.status);
      return await r.text();
    }catch(e){
      last=e;
      if(i<2)await sleep(1000*Math.pow(2,i));
    }
  }
  throw last;
}
function applyConfig(text,source){
  if(text===configText)return false;
  const next=JSON.parse(text);
  configText=text;
  config=next;
  state.configRevision=next.revision??null;
  state.configVersion=next.schemaVersion??null;
  state.configUpdatedAt=next.updatedAt??null;
  state.config.source=source;
  startNotices(config);
  setVideo();
  fitClock();
  renderDiagnostics();
  return true;
}
async function loadConfig(initial=false){
  try{
    const text=await fetchConfigWithRetry();
    const changed=applyConfig(text,'network');
    saveConfigCache(text);
    state.config.lastSuccess=new Date().toISOString();
    setHealth('config','ok');
    if(initial||changed){
      await Promise.allSettled([refreshWeather(),refreshAlerts()]);
    }
  }catch(e){
    console.error('Config refresh failed',e);
    const cached=getConfigCache();
    if(cached){
      const changed=applyConfig(cached.text,'cache');
      setHealth('config','delayed');
      if(initial||changed){
        await Promise.allSettled([refreshWeather(),refreshAlerts()]);
      }
    }else{
      setHealth('config','error');
    }
  }
}

function fitClock(){
  const row=document.querySelector('.time-line');
  const main=$('timeMain');
  if(!row||!main)return;
  main.style.fontSize='';
  let size=parseFloat(getComputedStyle(main).fontSize);
  const min=96;
  const max=size;
  let guard=0;
  while(row.scrollWidth>row.clientWidth&&size>min&&guard++<120){
    size-=2;
    main.style.fontSize=`${size}px`;
  }
  // Fill some empty space without exceeding CSS max.
  guard=0;
  while(row.scrollWidth<row.clientWidth*.9&&size<max&&guard++<80){
    size+=1;
    main.style.fontSize=`${size}px`;
    if(row.scrollWidth>row.clientWidth){
      size-=1;
      main.style.fontSize=`${size}px`;
      break;
    }
  }
}
function fitElement(el,min=13){
  if(!el)return;
  el.style.fontSize='';
  let size=parseFloat(getComputedStyle(el).fontSize);
  let guard=0;
  while((el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)&&size>min&&guard++<50){
    size-=1;
    el.style.fontSize=`${size}px`;
  }
}
function fitAlertText(){
  fitElement(document.querySelector('.alert-title'),15);
  fitElement(document.querySelector('.alert-detail'),12);
}
function fitWeatherText(){
  fitElement($('condition'),16);
}
function burnShift(){
  const positions=[[0,0],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  burnIndex=(burnIndex+1)%positions.length;
  const [x,y]=positions[burnIndex];
  document.documentElement.style.setProperty('--burn-x',`${x}px`);
  document.documentElement.style.setProperty('--burn-y',`${y}px`);
}

function renderDiagnostics(){
  const grid=$('diagnosticsGrid');
  if(!grid)return;
  const fmt=v=>v?new Date(v).toLocaleString():'—';
  const rows=[
    ['Schema version',state.configVersion??'—'],
    ['Config revision',state.configRevision??'—'],
    ['Config updated',state.configUpdatedAt?fmt(state.configUpdatedAt):'—'],
    ['Config health',`${state.config.status} · ${state.config.source}`],
    ['Config success',fmt(state.config.lastSuccess)],
    ['Weather health',`${state.weather.status} · ${state.weather.source}`],
    ['Weather success',fmt(state.weather.lastSuccess)],
    ['Alerts health',`${state.alerts.status} · ${state.alerts.source}`],
    ['Alerts success',fmt(state.alerts.lastSuccess)],
    ['Video health',state.video.status],
    ['Video success',fmt(state.video.lastSuccess)],
    ['Online',navigator.onLine?'Yes':'No'],
    ['Viewport',`${window.innerWidth} × ${window.innerHeight}`],
    ['Location',config.location?.label||'—'],
    ['Time zone',config.timeZone||'—']
  ];
  grid.innerHTML=rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');
}
function toggleDiagnostics(){
  const panel=$('diagnostics');
  panel.classList.toggle('open');
  panel.setAttribute('aria-hidden',panel.classList.contains('open')?'false':'true');
  renderDiagnostics();
}

function schedule(){
  clearInterval(configTimer);clearInterval(weatherTimer);clearInterval(alertsTimer);clearInterval(burnTimer);
  configTimer=setInterval(()=>loadConfig(false),30*60*1000);
  weatherTimer=setInterval(refreshWeather,10*60*1000);
  alertsTimer=setInterval(refreshAlerts,5*60*1000);
  burnTimer=setInterval(burnShift,10*60*1000);
}

initMetricIcons();
updateClock();
setInterval(updateClock,1000);
loadConfig(true).finally(schedule);

window.addEventListener('resize',()=>{
  fitClock();
  fitAlertText();
  fitWeatherText();
  repositionNotices();
  renderDiagnostics();
});
window.addEventListener('online',()=>loadConfig(false));
window.addEventListener('offline',()=>renderDiagnostics());
document.addEventListener('keydown',e=>{
  if((e.key==='d'||e.key==='D')&&!e.ctrlKey&&!e.altKey&&!e.metaKey)toggleDiagnostics();
});
