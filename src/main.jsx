import React, {createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Dock from './components/Dock';
import {DesktopProvider,MenuBar,WindowLayer,KeyboardShortcuts,Launcher,ContextMenu,QuickSettings,NotificationCenter,NotificationToasts,AppSwitcher,KeyboardHelp,HudOverlay,SnapPreview,useWindowManager,useTheme,pickInitialBounds,nextCascadeIndex,createMacosTheme} from './vendor/react-ui-os';
import {iconUrl} from './apps';
import {CATALOG_KEY,iconChoices,readCatalog,validateApp} from './catalog';
import './style.css';

const theme=createMacosTheme();
theme.chrome.dockTileSize=76;
theme.chrome.dockIconScale=1;
theme.chrome.menuBarHeight=30;
theme.appearance='light';
const POSTER='https://images.pexels.com/videos/2344549/free-video-2344549.jpg?auto=compress&h=1080&w=1920';
const VIDEO='https://videos.pexels.com/video-files/2344549/2344549-uhd_3840_2160_25fps.mp4';

const CatalogContext=createContext(null);
const useCatalog=()=>useContext(CatalogContext);

function Icon({art,size=76}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[art]);
  return failed?<span className="icon-fallback" aria-hidden="true">App</span>:<img alt="" draggable={false} width={size} height={size} className={`app-icon ${art.startsWith('fluent-')?'fluent-icon':''}`} src={iconUrl(art)} onError={()=>setFailed(true)}/>;
}

function AppFrame({service}) {
  const [attempt,setAttempt]=useState(0);
  const [loaded,setLoaded]=useState(false);
  const [help,setHelp]=useState(false);
  useEffect(()=>{setLoaded(false);setHelp(false);const timer=setTimeout(()=>setHelp(true),15000);return()=>clearTimeout(timer)},[attempt,service.url]);
  return <div className="app-frame">
    <div className="app-toolbar"><span>{new URL(service.url).hostname}</span><div><button onClick={()=>setAttempt(x=>x+1)} aria-label={`Reload ${service.name}`}>Reload</button><button aria-expanded={help} onClick={()=>setHelp(x=>!x)}>Trouble loading?</button><a href={service.url} target="_blank" rel="noopener noreferrer">Open in new tab ↗</a></div></div>
    {help&&<div className="frame-help">If this app blocks embedded windows or needs a separate sign-in, use <a href={service.url} target="_blank" rel="noopener noreferrer">Open in new tab</a>. A sleeping service may take a moment to start.</div>}
    {!loaded&&<div className="frame-status" role="status">Opening {service.name}…</div>}
    <iframe key={attempt} title={service.name} src={service.url} allow="clipboard-write; fullscreen" referrerPolicy="strict-origin-when-cross-origin" onLoad={()=>setLoaded(true)}/>
  </div>;
}

function AppEditor({initial,onClose}) {
  const {catalog,saveApp}=useCatalog();
  const [draft,setDraft]=useState(initial||{name:'',url:'',art:'safari',pinned:true});
  const [error,setError]=useState('');
  const set=(key,value)=>setDraft(d=>({...d,[key]:value}));
  const submit=e=>{
    e.preventDefault();
    try{
      const app=validateApp({...draft,id:draft.id||`custom-${crypto.randomUUID()}`});
      if(catalog.some(s=>s.id!==app.id&&s.url.replace(/\/$/,'')===app.url.replace(/\/$/,'')))throw new Error('That app is already in Applications.');
      saveApp(app);onClose();
    }catch(e){setError(e.message)}
  };
  return <form className="app-editor" onSubmit={submit}>
    <div className="editor-title"><h2>{initial?'Edit app':'Add app'}</h2><button type="button" onClick={onClose}>Cancel</button></div>
    <label>App name<input autoFocus value={draft.name} onChange={e=>set('name',e.target.value)} required maxLength={100}/></label>
    <label>App URL<input type="url" placeholder="https://your-app.onrender.com" value={draft.url} onChange={e=>set('url',e.target.value)} required/></label>
    <fieldset><legend>Choose an icon</legend>{[['Apple app icons',false],['Fluent color icons',true]].map(([title,fluent])=><div className="icon-collection" key={title}><h3>{title}</h3><div className="icon-picker">{iconChoices.filter(([art])=>art.startsWith('fluent-')===fluent).map(([art,label])=><button type="button" key={art} aria-label={label} aria-pressed={draft.art===art} onClick={()=>set('art',art)}><Icon art={art} size={52}/><span>{label.split(' · ')[0]}</span></button>)}</div></div>)}</fieldset>
    <label className="pin-option"><input type="checkbox" checked={draft.pinned} onChange={e=>set('pinned',e.target.checked)}/>Pin to Dock</label>
    {error&&<p role="alert" className="editor-error">{error}</p>}
    <button className="primary-button" type="submit">{initial?'Save changes':'Add app'}</button>
  </form>;
}

function Library() {
  const [query,setQuery]=useState('');
  const [editing,setEditing]=useState(null);
  const [manage,setManage]=useState(false);
  const {catalog,apps,saveMessage}=useCatalog();
  const wm=useWindowManager(),theme=useTheme();
  const filtered=catalog.filter(s=>(s.name+' '+s.category).toLowerCase().includes(query.toLowerCase()));
  const open=id=>{const payload={kind:'app',appId:id};wm.openWindow(payload,pickInitialBounds(payload,theme,apps,undefined,nextCascadeIndex(wm.state)))};
  return <section className="app-library">
    <div className="library-heading"><h1>Applications</h1><div><button className="secondary-button" aria-pressed={manage} onClick={()=>setManage(x=>!x)}>{manage?'Done':'Edit apps'}</button><button className="primary-button" onClick={()=>setEditing({})}>+ Add app</button></div></div>
    {editing?<AppEditor initial={editing.id?editing:undefined} onClose={()=>setEditing(null)}/>:<>
    <label className="search-label"><span className="sr-only">Search applications</span><input placeholder="Search applications" type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    {saveMessage&&<p className="save-message" role="status">{saveMessage}</p>}
    <div className="app-grid">{filtered.map(s=><div className="library-app" key={s.id}><button onClick={()=>open(s.id)}><Icon art={s.art} size={72}/><span>{s.name}</span></button>{manage&&<button className="edit-app-button" onClick={()=>setEditing(s)} aria-label={`Edit ${s.name}`}>Edit</button>}</div>)}</div>{filtered.length===0&&<p>No matching applications.</p>}</>}
  </section>;
}

function RegistryFrame({appId}) {
  const {catalog}=useCatalog();
  const service=catalog.find(s=>s.id===appId);
  return service?<AppFrame service={service}/>:null;
}
const libraryApp={id:'applications',name:'Applications',defaultBounds:{w:820,h:620},icon:({size})=><Icon art="app-store" size={size}/>,content:Library};
function DesktopRoot() {
  const [catalog,setCatalog]=useState(()=>{try{return readCatalog(localStorage)}catch{return readCatalog({getItem:()=>null})}});
  const [saveMessage,setSaveMessage]=useState('');
  const apps=useMemo(()=>[...catalog.map(s=>({id:s.id,name:s.name,tagline:s.category,category:s.category,defaultBounds:{w:1160,h:730},icon:({size})=><Icon art={s.art} size={size}/>,content:RegistryFrame})),libraryApp],[catalog]);
  const saveApp=app=>{
    const next=catalog.some(s=>s.id===app.id)?catalog.map(s=>s.id===app.id?app:s):[...catalog,app];
    try{localStorage.setItem(CATALOG_KEY,JSON.stringify(next));setSaveMessage('Saved in this browser.')}catch{setSaveMessage('Added for this session. This browser could not save it for next time.')}
    setCatalog(next);
  };
  return <CatalogContext.Provider value={{catalog,apps,saveApp,saveMessage}}><DesktopProvider apps={apps} theme={theme}><DesktopContent/></DesktopProvider></CatalogContext.Provider>;
}

function LiveWallpaper() {
  const ref=useRef(null);
  const [paused,setPaused]=useState(()=>{try{return localStorage.getItem('desktop.pauseWallpaper')==='true'}catch{return false}});
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[]);
  useEffect(()=>{const update=()=>{if(paused||reduced||document.hidden)ref.current?.pause();else ref.current?.play().catch(()=>{})};update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[paused,reduced]);
  return <><div className="wallpaper" style={{backgroundImage:`url(${POSTER})`}}><video ref={ref} poster={POSTER} src={reduced?undefined:VIDEO} muted loop playsInline preload="metadata" aria-hidden="true"/></div><button className="wallpaper-toggle" onClick={()=>setPaused(x=>{try{localStorage.setItem('desktop.pauseWallpaper',String(!x))}catch{}return !x})} aria-label={paused?'Play wallpaper':'Pause wallpaper'} disabled={reduced}>{reduced?'Still wallpaper':paused?'Play wallpaper':'Pause wallpaper'}</button></>;
}

function DesktopContent() {
  const wm=useWindowManager(),theme=useTheme();
  const {catalog,apps}=useCatalog();
  const pinnedIds=[...catalog.filter(s=>s.id.startsWith('custom-')&&s.pinned),...catalog.filter(s=>!s.id.startsWith('custom-')&&s.pinned)].map(s=>s.id);
  const [width,setWidth]=useState(innerWidth);
  useEffect(()=>{const update=()=>setWidth(innerWidth);addEventListener('resize',update);return()=>removeEventListener('resize',update)},[]);
  // Keep the user's larger icon size on narrow screens; fewer pins remain visible.
  const baseSize=76;
  const capacity=Math.max(1,Math.min(pinnedIds.length,Math.floor((width-190)/86)-1));
  const runningIds=wm.windows.filter(w=>w.payload.kind==='app'&&w.payload.appId!=='applications').map(w=>w.payload.appId);
  const visibleIds=[...new Set([...runningIds,...pinnedIds])].slice(0,capacity);
  const open=id=>{const current=wm.windows.find(w=>w.payload.kind==='app'&&w.payload.appId===id);if(current){if(current.state==='minimized')wm.restoreWindow(current.id);else if(wm.state.focusedId===current.id)wm.minimizeWindow(current.id);else wm.focusWindow(current.id);return}const payload={kind:'app',appId:id};wm.openWindow(payload,pickInitialBounds(payload,theme,apps,undefined,nextCascadeIndex(wm.state)))};
  const items=[...visibleIds,'applications'].map(id=>{const app=apps.find(a=>a.id===id);const service=catalog.find(s=>s.id===id);return {id,label:app.name,active:wm.windows.some(w=>w.payload.kind==='app'&&w.payload.appId===id),icon:<Icon art={service?.art??'app-store'}/>,onSelect:()=>open(id)}});
  return <div className="desktop"><LiveWallpaper/><MenuBar brand="Occu-Med"/><SnapPreview/><WindowLayer/><div className="dock-position"><Dock key={capacity} items={items} baseSize={baseSize} gap={10} distance={258} magnification={1.5} className="desktop-dock"/></div><KeyboardShortcuts/><Launcher/><ContextMenu/><QuickSettings/><NotificationCenter/><NotificationToasts/><AppSwitcher/><KeyboardHelp/><HudOverlay/></div>;
}

createRoot(document.getElementById('root')).render(<DesktopRoot/>);
