import {initMetricIcons,iconFor,getWeather,getCachedWeather,getAlerts,getCachedAlerts} from './weather.js';
import {startNotices} from './notices.js';

let config={};
let configText='';
let weatherTimer,alertsTimer,configTimer,pageTimer;

const $=id=>document.getElementById(id);

const format24=(d,tz)=>new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(d));

function setStatus(type,text){
  const bar=document.querySelector('.status-strip');
  bar.className='status-strip'+(type?` ${type}`:'');
  $('statusText').textContent=text;
}
function updateClock(){
  const tz=config.timeZone||'America/Denver';
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const get=t=>parts.find(p=>p.type===t)?.value||'00';
  $('timeMain').textContent=`${get('hour')}:${get('minute')}`;
  $('timeSeconds').textContent=get('second');
  $('dateText').textContent=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(now);
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
function setVideo(){
  const id=youtubeId(config.youtubeUrl||'');
  const frame=$('videoFrame'),fb=$('videoFallback');
  if(config.showVideo===false||!id){
    frame.removeAttribute('src');frame.style.display='none';fb.style.display='flex';return;
  }
  frame.style.display='block';fb.style.display='none';
  frame.src=`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&loop=1&playlist=${id}`;
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
function renderWeather(w,cached){
  $('temperature').textContent=w.tempF==null?'--°F':`${w.tempF}°F`;
  $('condition').textContent=w.description||'Weather unavailable';
  $('weatherIcon').innerHTML=iconFor(w.description||'');
  $('wind').textContent=w.wind||'--';
  $('humidity').textContent=w.humidity==null?'--%':`${Math.round(w.humidity)}%`;
  $('updatedText').textContent=`Updated ${w.updated?format24(w.updated,config.timeZone||'America/Denver'):'--:--'}`;

  const lat=Number(config.location?.latitude),lon=Number(config.location?.longitude);
  if(Number.isFinite(lat)&&Number.isFinite(lon)){
    $('sunrise').textContent=format24(solar(new Date(),lat,lon,true),config.timeZone||'America/Denver');
    $('sunset').textContent=format24(solar(new Date(),lat,lon,false),config.timeZone||'America/Denver');
  }
  setStatus(cached?'delayed':'',cached?'DELAYED':'LIVE');
}
function renderAlerts(list,cached){
  const el=$('alerts');
  if(!list.length){
    el.className='alerts';
    el.innerHTML='<div class="alert-title">No active weather alerts</div><div class="alert-detail"></div>';
    return;
  }
  const a=list[0],s=(a.severity||'').toLowerCase(),event=(a.event||'').toLowerCase();
  let klass='';
  if(s==='extreme'||s==='severe'||event.includes('warning'))klass='warning';
  else if(event.includes('watch'))klass='watch';
  else if(event.includes('advisory'))klass='advisory';
  el.className=`alerts ${klass}`;
  el.innerHTML=`<div class="alert-title">${a.event||'Weather Alert'}</div><div class="alert-detail">${a.headline||''}${cached?' · Delayed':''}</div>`;
}

async function refreshWeather(){
  try{
    const r=await getWeather(config);renderWeather(r.weather,r.cached);
  }catch(e){
    console.error(e);
    const c=getCachedWeather();
    if(c)renderWeather(c.weather,true);
    else setStatus('error','CONNECTION ERROR');
  }
}
async function refreshAlerts(){
  try{
    const r=await getAlerts(config);renderAlerts(r.alerts,r.cached);
  }catch(e){
    console.error(e);
    const c=getCachedAlerts();
    if(c)renderAlerts(c.alerts,true);
    else $('alerts').innerHTML='<div class="alert-title">Weather alerts unavailable</div><div class="alert-detail"></div>';
  }
}

function schedule(){
  clearInterval(configTimer);clearInterval(weatherTimer);clearInterval(alertsTimer);clearTimeout(pageTimer);
  configTimer=setInterval(()=>loadConfig(false),30*60*1000);
  weatherTimer=setInterval(refreshWeather,10*60*1000);
  alertsTimer=setInterval(refreshAlerts,5*60*1000);
  pageTimer=setTimeout(()=>location.reload(),30*60*1000);
}
async function loadConfig(initial){
  try{
    const r=await fetch(`config.json?v=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)throw new Error(r.status);
    const text=await r.text();
    if(!initial&&text===configText)return;
    configText=text;
    config=JSON.parse(text);
    setVideo();
    startNotices(config);
    if(initial){
      await Promise.allSettled([refreshWeather(),refreshAlerts()]);
      schedule();
    }
  }catch(e){
    console.error(e);
    setStatus('error','CONFIG ERROR');
  }
}

initMetricIcons();
updateClock();
setInterval(updateClock,1000);
loadConfig(true);
window.addEventListener('resize',()=>startNotices(config));
