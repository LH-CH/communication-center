const WEATHER_CACHE='display-weather-v3.2';
const ALERT_CACHE='display-alerts-v3.2';

const ICONS={
  sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.42"/></svg>`,
  cloud:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  rain:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17.5 17H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m8 20-1 2M13 20l-1 2M18 20l-1 2"/></svg>`,
  snow:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M8 20h.01M12 19h.01M16 20h.01"/></svg>`,
  storm:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m13 16-3 5h4l-2 3"/></svg>`,
  fog:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17.5 14H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M4 18h16M7 22h10"/></svg>`,
  partly:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M12 2v2M4.93 4.93l1.42 1.42M2 12h2M19.07 4.93l-1.41 1.42"/><path d="M17.5 21H9a6 6 0 1 1 5.78-7.6h2.72a3.8 3.8 0 1 1 0 7.6Z"/></svg>`,
  wind:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M3 8h12.5a3.5 3.5 0 1 0-3.5-3.5M3 12h17M3 16h11a3 3 0 1 1-3 3"/></svg>`,
  humidity:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2.7 6.6 9a8 8 0 1 0 10.8 0L12 2.7Z"/></svg>`,
  sunrise:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M12 2v8M8 6l4-4 4 4M4 18h16M6 15a6 6 0 0 1 12 0"/></svg>`,
  sunset:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M12 10V2M8 6l4 4 4-4M4 18h16M6 15a6 6 0 0 1 12 0"/></svg>`
};

export function initMetricIcons(){
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=ICONS[el.dataset.icon]||'');
}
export function iconFor(description=''){
  const s=description.toLowerCase();
  if(s.includes('thunder'))return ICONS.storm;
  if(s.includes('snow')||s.includes('sleet')||s.includes('flurr'))return ICONS.snow;
  if(s.includes('rain')||s.includes('shower')||s.includes('drizzle'))return ICONS.rain;
  if(s.includes('fog')||s.includes('mist')||s.includes('haze'))return ICONS.fog;
  if(s.includes('partly')||s.includes('mostly'))return ICONS.partly;
  if(s.includes('cloud')||s.includes('overcast'))return ICONS.cloud;
  return ICONS.sun;
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function fetchJson(url,{timeout=12000,attempts=3}={}){
  let lastError;
  for(let attempt=0;attempt<attempts;attempt++){
    const c=new AbortController();
    const t=setTimeout(()=>c.abort(),timeout);
    try{
      const r=await fetch(url,{headers:{Accept:'application/geo+json'},cache:'no-store',signal:c.signal});
      if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);
      return await r.json();
    }catch(e){
      lastError=e;
      if(attempt<attempts-1)await sleep(1000*Math.pow(2,attempt));
    }finally{
      clearTimeout(t);
    }
  }
  throw lastError;
}

const cToF=c=>Math.round(c*9/5+32);
const kphToMph=k=>Math.round(k*.621371);
const dir=d=>d==null?'--':['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8];

function saveCache(key,data){
  localStorage.setItem(key,JSON.stringify({savedAt:new Date().toISOString(),data}));
}
function readCache(key){
  try{
    const raw=JSON.parse(localStorage.getItem(key)||'null');
    if(!raw)return null;
    if(raw.data!==undefined)return raw;
    return {savedAt:null,data:raw}; // backward compatibility
  }catch{return null}
}

export async function getWeather(config){
  const lat=Number(config.location?.latitude);
  const lon=Number(config.location?.longitude);
  if(!Number.isFinite(lat)||!Number.isFinite(lon))throw new Error('Location required');

  const point=await fetchJson(`https://api.weather.gov/points/${lat},${lon}`);
  const [hourly,daily,stations]=await Promise.all([
    fetchJson(point.properties.forecastHourly),
    fetchJson(point.properties.forecast),
    fetchJson(point.properties.observationStations)
  ]);
  const station=stations?.features?.[0]?.properties?.stationIdentifier;
  const obs=station?await fetchJson(`https://api.weather.gov/stations/${station}/observations/latest`):null;

  const op=obs?.properties||{};
  const present=hourly?.properties?.periods?.[0]||{};
  const tempC=op.temperature?.value;
  const windKph=op.windSpeed?.value;

  const dailyPeriods=daily?.properties?.periods||[];
  const firstDay=dailyPeriods.find(p=>p.isDaytime===true);
  const firstNight=dailyPeriods.find(p=>p.isDaytime===false);

  const weather={
    tempF:tempC==null?present.temperature:cToF(tempC),
    description:op.textDescription||present.shortForecast||'Weather unavailable',
    wind:windKph==null?`${present.windSpeed||'--'} ${present.windDirection||''}`.trim():`${kphToMph(windKph)} mph ${dir(op.windDirection?.value)}`,
    humidity:op.relativeHumidity?.value,
    highF:firstDay?.temperature ?? null,
    lowF:firstNight?.temperature ?? null,
    updated:op.timestamp||new Date().toISOString()
  };
  saveCache(WEATHER_CACHE,weather);
  return {weather,cached:false,savedAt:new Date().toISOString()};
}
export function getCachedWeather(){
  const c=readCache(WEATHER_CACHE);
  return c?{weather:c.data,cached:true,savedAt:c.savedAt}:null;
}

export async function getAlerts(config){
  const lat=Number(config.location?.latitude);
  const lon=Number(config.location?.longitude);
  const d=await fetchJson(`https://api.weather.gov/alerts/active?point=${lat},${lon}&status=actual`);
  const alerts=(d.features||[]).map(f=>f.properties||{});
  saveCache(ALERT_CACHE,alerts);
  return {alerts,cached:false,savedAt:new Date().toISOString()};
}
export function getCachedAlerts(){
  const c=readCache(ALERT_CACHE);
  return c?{alerts:c.data,cached:true,savedAt:c.savedAt}:null;
}
