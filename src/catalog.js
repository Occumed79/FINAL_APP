import {services,pinnedIds} from './apps.js';
import {fluentChoices} from './fluent-icons.js';

// Apple artwork already used by the supplied SmoothUI source. No new icon service.
export const iconChoices = [
  ['numbers-make-spreadsheets','Numbers · analytics'],['find-my','Find My · locations'],
  ['preview','Preview · documents'],['safari','Safari · research'],
  ['stocks','Stocks · pricing'],['reminders','Reminders · orders'],
  ['pages-create-documents','Pages · forms and agreements'],['textedit','TextEdit · signing'],
  ['books','Books · source library'],['contacts','Contacts · providers'],
  ['grapher','Grapher · trends'],['calculator','Calculator · conversion'],
  ['calendar','Calendar · scheduling'],['system-settings','Settings · administration'],
  ['app-store','App Store · applications'],['activity-monitor','Activity Monitor'],
  ['terminal','Terminal'],['shortcuts','Shortcuts'],
  ...fluentChoices,
];
export const CATALOG_KEY='desktop.apps.v1';

export function validateApp(input) {
  const name=String(input.name??'').trim();
  if(!name)throw new Error('Enter an app name.');
  let url;
  try{url=new URL(String(input.url??'').trim());}catch{throw new Error('Enter a complete web address, such as https://your-app.onrender.com.');}
  if(!['https:','http:'].includes(url.protocol))throw new Error('Use an http or https web address.');
  if(url.username||url.password)throw new Error('Use the app’s regular web address without sign-in details.');
  const art=iconChoices.some(([id])=>id===input.art)?input.art:'safari';
  return {id:input.id,name:name.slice(0,100),url:url.href,art,category:input.category||'My apps',pinned:Boolean(input.pinned)};
}

export function readCatalog(storage) {
  const defaults=services.map(s=>({...s,pinned:pinnedIds.includes(s.id)}));
  try{
    const saved=JSON.parse(storage.getItem(CATALOG_KEY)||'[]');
    if(!Array.isArray(saved))return defaults;
    const rows=saved.flatMap(s=>{try{return typeof s.id==='string'?[validateApp(s)]:[]}catch{return []}});
    const byId=new Map(rows.map(s=>[s.id,s]));
    return [...defaults.map(s=>byId.get(s.id)||s),...[...byId.values()].filter(s=>s.id.startsWith('custom-')&&!defaults.some(d=>d.id===s.id))];
  }catch{return defaults;}
}
