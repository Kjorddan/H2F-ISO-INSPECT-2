import React,{useEffect,useRef,useState}from'react';

const P={
 new:<><path d="M4 3h10l4 4v14H4z"/><path d="M14 3v5h5M8 13h7M11.5 9.5v7"/></>,
 open:<><path d="M3 7h7l2 2h9l-3 10H5z"/><path d="M3 7V5h7l2 2"/></>,
 save:<><path d="M4 3h14l3 3v15H4z"/><path d="M8 3v6h8V3M8 21v-7h9v7"/></>,
 undo:<path d="M9 7 4 12l5 5M5 12h8a6 6 0 0 1 6 6"/>,
 redo:<path d="m15 7 5 5-5 5M19 12h-8a6 6 0 0 0-6 6"/>,
 select:<><path d="m5 3 12 10-6 1-3 6z"/><path d="m12 14 5 6"/></>,
 pan:<><path d="M8 11V6a2 2 0 0 1 4 0v4M12 10V5a2 2 0 0 1 4 0v6M16 11V8a2 2 0 0 1 4 0v7c0 4-3 7-7 7h-1c-3 0-5-2-7-5l-2-3a2 2 0 0 1 3-2l2 2"/></>,
 line:<path d="M4 19 20 5"/>,
 pipe:<><path d="M3 17h7l4-5h7"/><circle cx="10" cy="17" r="1.5"/><circle cx="14" cy="12" r="1.5"/></>,
 component:<><path d="M4 12h5M15 12h5"/><path d="m9 7 6 5-6 5zM15 7l-6 5 6 5z"/></>,
 dimension:<><path d="M4 7v10M20 7v10M6 12h12"/><path d="m8 10-2 2 2 2m8-4 2 2-2 2"/></>,
 elevation:<><path d="M4 17h16"/><path d="m12 4-5 8h10z"/></>,
 coordinate:<><circle cx="12" cy="12" r="8"/><path d="M12 2v20M2 12h20"/></>,
 flow:<><path d="M4 12h15"/><path d="m14 7 5 5-5 5"/></>,
 north:<><path d="m12 3 5 16-5-4-5 4z"/><text x="12" y="9" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">N</text></>,
 text:<><path d="M5 5h14M12 5v14M8 19h8"/></>,
 tag:<><path d="M3 7v10l8 4 10-9L11 3z"/><circle cx="9" cy="8" r="1.5"/></>,
 leader:<><path d="m4 18 7-7h8"/><path d="m4 18 2-5 3 3z"/></>,
 library:<><path d="M4 4h5v7H4zM15 4h5v7h-5zM4 15h5v5H4zM15 15h5v5h-5z"/></>,
 properties:<><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="18" r="2"/></>,
 fit:<><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></>,
 zoom100:<><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/><text x="10" y="12" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">1:1</text></>,
 pdf:<><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5"/><text x="12" y="17" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">PDF</text></>,
 inspect:<><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6M10 7v6"/></>,
 grid:<><path d="M4 4h16v16H4zM4 9h16M4 15h16M9 4v16M15 4v16"/></>,
 more:<><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></>,
 close:<path d="m6 6 12 12M18 6 6 18"/>,
 chevron:<path d="m8 10 4 4 4-4"/>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
};

export function Icon({name,size=18}){
 return <svg className="cadIcon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{P[name]||P.info}</svg>
}

export function ToolButton({icon,label,shortcut,onClick,active=false,disabled=false,className='',showLabel=true,testId}){
 const tip=shortcut?`${label} — ${shortcut}`:label;
 return <button data-testid={testId} type="button" className={`toolButton ${active?'active':''} ${className}`} aria-label={label} data-tooltip={tip} onClick={onClick} disabled={disabled}><Icon name={icon}/>{showLabel&&<span className="toolButtonLabel">{label}</span>}</button>
}

function MenuEntry({item,close}){
 const disabled=!!item.disabled;
 const reason=typeof item.disabled==='string'?item.disabled:item.reason;
 if(item.children?.length)return <div className="menuEntry hasSubmenu" role="none"><button type="button" role="menuitem" aria-haspopup="menu"><span>{item.label}</span><span>›</span></button><div className="submenu" role="menu">{item.children.map((x,i)=><MenuEntry key={x.id||x.label||i} item={x} close={close}/>)}</div></div>;
 return <div className="menuEntry" role="none"><button type="button" role="menuitem" disabled={disabled} title={disabled&&reason?reason:undefined} onClick={()=>{if(disabled)return;item.action?.();close()}}><span>{item.label}</span>{item.shortcut&&<kbd>{item.shortcut}</kbd>}{disabled&&reason&&<small>{reason}</small>}</button></div>
}

export function MenuBar({menus}){
 const[open,setOpen]=useState(null);
 const root=useRef(null);
 useEffect(()=>{const down=e=>{if(root.current&&!root.current.contains(e.target))setOpen(null)};const key=e=>{if(e.key==='Escape')setOpen(null)};window.addEventListener('pointerdown',down);window.addEventListener('keydown',key);return()=>{window.removeEventListener('pointerdown',down);window.removeEventListener('keydown',key)}},[]);
 return <nav className="cadMenuBar" aria-label="Menu principal" ref={root}>{menus.map(m=><div className="cadMenu" key={m.id}><button type="button" className={open===m.id?'open':''} aria-expanded={open===m.id} onClick={e=>{e.stopPropagation();setOpen(open===m.id?null:m.id)}}>{m.label}</button>{open===m.id&&<div className="menuPopup" role="menu">{m.items.map((x,i)=><MenuEntry key={x.id||x.label||i} item={x} close={()=>setOpen(null)}/>)}</div>}</div>)}</nav>
}

export function ToolbarMore({items}){
 const[open,setOpen]=useState(false),root=useRef(null);
 useEffect(()=>{const h=e=>{if(root.current&&!root.current.contains(e.target))setOpen(false)};window.addEventListener('pointerdown',h);return()=>window.removeEventListener('pointerdown',h)},[]);
 return <div className="toolbarMore" ref={root}><ToolButton icon="more" label="Mais ferramentas" onClick={e=>{e.stopPropagation();setOpen(!open)}} showLabel={false}/>{open&&<div className="toolbarMorePopup">{items.map((x,i)=><button key={x.id||x.label||i} type="button" disabled={x.disabled} title={x.reason} onClick={()=>{if(x.disabled)return;x.action?.();setOpen(false)}}><Icon name={x.icon||'info'} size={16}/><span>{x.label}</span></button>)}</div>}</div>
}

export function PanelHeader({title,onClose,onAutoHide,autoHide=false,side='right',meta}){
 return <div className="panelHeader"><div><h3>{title}</h3>{meta&&<small>{meta}</small>}</div><div className="panelHeaderActions">{onAutoHide&&<button type="button" className={autoHide?'active':''} data-tooltip={autoHide?'Fixar painel':'Auto-ocultar painel'} aria-label={autoHide?'Fixar painel':'Auto-ocultar painel'} onClick={onAutoHide}>◉</button>}<button type="button" data-tooltip={side==='left'?'Recolher biblioteca':'Ocultar propriedades'} aria-label={side==='left'?'Recolher biblioteca':'Ocultar propriedades'} onClick={onClose}><Icon name="close" size={15}/></button></div></div>
}

export function NoticeDialog({notice,onClose}){
 if(!notice)return null;
 return <div className="shellModalBackdrop" role="presentation" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="shellModal" role="dialog" aria-modal="true" aria-labelledby="shell-notice-title"><div className="panelHeader"><h3 id="shell-notice-title">{notice.title}</h3><button type="button" aria-label="Fechar" onClick={onClose}><Icon name="close" size={15}/></button></div><div className="shellModalBody">{String(notice.body||'').split('\n').map((x,i)=><p key={i}>{x}</p>)}</div><div className="shellModalFooter"><button type="button" onClick={onClose}>Fechar</button></div></section></div>
}
