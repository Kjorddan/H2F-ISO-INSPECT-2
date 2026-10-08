import{SHEET_FORMATS,sheetSize,updateTitleBlock}from'./document-structure.js';
export const UX08_SCHEMA='h2f-sheet-layout/v1';
export const UX08_PAPER=Object.freeze({width:1120,height:720});
export const UX08_TEMPLATE_STORAGE='h2f.iso.sheetTemplates.ux08.v1';
export const UX08_TABLE_KINDS=Object.freeze(['MATERIAL','WELD','END','TML','REVISION','NOTES','MANUAL']);
export const UX08_ANCHORS=Object.freeze(['TOP_LEFT','TOP_RIGHT','BOTTOM_LEFT','BOTTOM_RIGHT']);
const clone=v=>structuredClone(v);
const txt=(v,n=140)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n);
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const sorted=t=>t.slice().sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'));
export const UX08_PRESETS=Object.freeze([
 {id:'H2F_CORPORATIVO',name:'H2F Corporativo',style:'CORPORATE',frame:{visible:true,zones:true,zoneCount:6,marginsMm:{left:20,right:10,top:10,bottom:10}},tables:['MATERIAL','WELD','END']},
 {id:'H2F_CAMPO_END',name:'H2F Campo / END',style:'FIELD',frame:{visible:true,zones:true,zoneCount:6,marginsMm:{left:20,right:10,top:10,bottom:10}},tables:['END','TML','NOTES']},
 {id:'H2F_MINIMALISTA',name:'H2F Minimalista',style:'MINIMAL',frame:{visible:true,zones:false,zoneCount:4,marginsMm:{left:15,right:10,top:10,bottom:10}},tables:[]}
]);
export const ux08DefaultFrame=()=>({visible:true,zones:true,zoneCount:6,marginsMm:{left:20,right:10,top:10,bottom:10}});
export const ux08DefaultLayout=()=>({schema:UX08_SCHEMA,templateId:'H2F_CORPORATIVO',style:'CORPORATE',frame:ux08DefaultFrame(),titleBlock:{visible:true,widthMm:175,heightMm:62},tables:[]});
export const ux08Layout=s=>{
 const raw=s?.pageLayout&&typeof s.pageLayout==='object'?s.pageLayout:{};
 const df=ux08DefaultLayout(),frame=raw.frame||{},margins=frame.marginsMm||{},tb=raw.titleBlock||{};
 return{schema:UX08_SCHEMA,templateId:txt(raw.templateId||df.templateId,64),style:['CORPORATE','FIELD','MINIMAL'].includes(raw.style)?raw.style:df.style,
 frame:{visible:frame.visible!==false,zones:frame.zones!==false,zoneCount:Number.isInteger(frame.zoneCount)?frame.zoneCount:df.frame.zoneCount,marginsMm:{...df.frame.marginsMm,...margins}},
 titleBlock:{visible:tb.visible!==false,widthMm:tb.widthMm??df.titleBlock.widthMm,heightMm:tb.heightMm??df.titleBlock.heightMm},
 tables:Array.isArray(raw.tables)?clone(raw.tables):[]
 };
};
export function ux08ValidateSheet(s){
 const errors=[];if(!s||typeof s!=='object')return{valid:false,errors:['sheet-required']};
 if(s.format!=='CUSTOM'&&!Object.hasOwn(SHEET_FORMATS,s.format))errors.push('format');
 if(!['landscape','portrait'].includes(s.orientation))errors.push('orientation');
 if(s.format==='CUSTOM'&&(!Array.isArray(s.customSize)||s.customSize.length!==2||s.customSize.some(x=>!finite(x,100,2000))))errors.push('customSize');
 const size=sheetSize(s),layout=ux08Layout(s),m=layout.frame.marginsMm;
 for(const[k,n]of Object.entries(m))if(!finite(n,0,40))errors.push('margin-'+k);
 if(m.left+m.right>=size.width-20||m.top+m.bottom>=size.height-20)errors.push('margin-overlap');
 if(!Number.isInteger(layout.frame.zoneCount)||layout.frame.zoneCount<2||layout.frame.zoneCount>12)errors.push('zone-count');
 const innerW=size.width-m.left-m.right,innerH=size.height-m.top-m.bottom;
 if(!finite(layout.titleBlock.widthMm,30,500)||!finite(layout.titleBlock.heightMm,20,220)||layout.titleBlock.widthMm>innerW||layout.titleBlock.heightMm>innerH)errors.push('titleBlock-size');
 if(layout.tables.length>12)errors.push('tables-max');
 const ids=new Set();
 for(const table of layout.tables){
  if(!table?.id||ids.has(table.id))errors.push('table-id');
  ids.add(table?.id);
  if(!UX08_TABLE_KINDS.includes(table?.kind))errors.push('table-kind');
  if(!UX08_ANCHORS.includes(table?.anchor))errors.push('table-anchor');
  if(!finite(table?.widthMm,25,500)||table.widthMm>innerW)errors.push('table-width');
  if(!Number.isInteger(table?.maxRows)||table.maxRows<1||table.maxRows>15)errors.push('table-rows');
  if(!Array.isArray(table?.manualRows)||table.manualRows.length>15||table.manualRows.some(row=>!Array.isArray(row)||row.length>5||row.some(v=>typeof v!=='string'||v.length>120)))errors.push('manual-rows');
 }
 return{valid:errors.length===0,errors:[...new Set(errors)]};
}
export function ux08SetPage(d,sheetId,{format,orientation,customSize}={}){
 if(!d.sheets.some(x=>x.id===sheetId))throw Error('Folha não localizada');
 const candidate={...d,sheets:d.sheets.map(x=>x.id===sheetId?{...x,format:format??x.format,orientation:orientation??x.orientation,customSize:customSize===undefined?x.customSize:customSize}:x)};
 const current=candidate.sheets.find(x=>x.id===sheetId);const v=ux08ValidateSheet(current);
 if(!v.valid)throw Error(v.errors.join(','));
 return candidate;
}
export function ux08UpdateLayout(d,sheetId,patch){
 if(!d.sheets.some(x=>x.id===sheetId))throw Error('Folha não localizada');
 const out=clone(d);
 const s=out.sheets.find(x=>x.id===sheetId),previous=ux08Layout(s);
 s.pageLayout={...previous,...patch,frame:{...previous.frame,...patch.frame,marginsMm:{...previous.frame.marginsMm,...patch.frame?.marginsMm}},titleBlock:{...previous.titleBlock,...patch.titleBlock},tables:patch.tables===undefined?previous.tables:clone(patch.tables)};
 const v=ux08ValidateSheet(s);
 if(!v.valid)throw Error(v.errors.join(','));
 return out;
}
export function ux08NewTable(kind,id,overrides={}){
 if(!UX08_TABLE_KINDS.includes(kind))throw Error('Tabela não suportada');
 return{id,kind,title:{MATERIAL:'LISTA DE MATERIAIS',WELD:'MAPA DE SOLDAS',END:'MAPA DE END',TML:'PONTOS TML / CML',REVISION:'HISTÓRICO DE REVISÕES',NOTES:'NOTAS GERAIS',MANUAL:'TABELA PERSONALIZADA'}[kind],
 anchor:'TOP_LEFT',widthMm:150,maxRows:7,visible:true,manualRows:[],...overrides};
}
export function ux08AddTable(d,sheetId,table){
 const sheet=d.sheets.find(x=>x.id===sheetId);if(!sheet)throw Error('Folha não localizada');
 const layout=ux08Layout(sheet);if(layout.tables.some(x=>x.id===table.id))throw Error('ID de tabela duplicado');
 return ux08UpdateLayout(d,sheetId,{tables:[...layout.tables,clone(table)]});
}
export function ux08EditTable(d,sheetId,id,patch){
 const sheet=d.sheets.find(x=>x.id===sheetId);if(!sheet)throw Error('Folha não localizada');
 return ux08UpdateLayout(d,sheetId,{tables:ux08Layout(sheet).tables.map(t=>t.id===id?{...t,...patch}:t)});
}
export function ux08RemoveTable(d,sheetId,id){
 const sheet=d.sheets.find(x=>x.id===sheetId);if(!sheet)throw Error('Folha não localizada');
 return ux08UpdateLayout(d,sheetId,{tables:ux08Layout(sheet).tables.filter(x=>x.id!==id)});
}
export function ux08FrameGeometry(sheet,{width=1120,height=720,padding=18}={}){
 const sz=sheetSize(sheet),layout=ux08Layout(sheet),m=layout.frame.marginsMm;
 const scale=Math.min((width-2*padding)/sz.width,(height-2*padding)/sz.height);
 const paper={x:(width-sz.width*scale)/2,y:(height-sz.height*scale)/2,width:sz.width*scale,height:sz.height*scale};
 const frame={x:paper.x+m.left*scale,y:paper.y+m.top*scale,width:(sz.width-m.left-m.right)*scale,height:(sz.height-m.top-m.bottom)*scale};
 const titleBlock={width:Math.min(layout.titleBlock.widthMm,sz.width-m.left-m.right)*scale,height:Math.min(layout.titleBlock.heightMm,sz.height-m.top-m.bottom)*scale};
 titleBlock.x=frame.x+frame.width-titleBlock.width;titleBlock.y=frame.y+frame.height-titleBlock.height;
 return{paper,frame,titleBlock,scale,sizeMm:sz,marginsMm:clone(m)};
}
const cleanRows=rows=>rows.map(row=>row.map(value=>txt(value,70)));
const fitRows=(rows,max)=>rows.slice(0,max);
export function ux08TableData(table,{sheet,entities=[],inspection={},document={}}={}){
 const store={welds:[],ndt:[],points:[],measurements:[],...inspection},get=(x)=>txt(x,58);
 if(table.kind==='MATERIAL'){
  const items=entities.filter(e=>(!e.sheetId||e.sheetId===sheet?.id)&&['industrial-symbol','pipe-run'].includes(e.kind));
  const grouped=new Map();
  for(const e of items){const description=get(e.name||e.symbolId||e.kind),tag=get(e.tag||e.engineering?.lineNumber||e.id),material=get(e.engineering?.material||e.material||'—');const key=[description,material].join('|');const v=grouped.get(key)||{count:0,description,tag,material};v.count++;grouped.set(key,v)}
  return{headers:['ITEM / COMPONENTE','MATERIAL','QTD'],rows:fitRows([...grouped.values()].sort((a,b)=>a.description.localeCompare(b.description)).map(x=>[x.description,x.material,String(x.count)]),table.maxRows),total:grouped.size};
 }
 if(table.kind==='WELD')return{headers:['SOLDA','TIPO','SITUAÇÃO'],rows:fitRows(store.welds.map(w=>[get(w.number),get(w.type||'—'),get(w.status||'PLANNED')]),table.maxRows),total:store.welds.length};
 if(table.kind==='END')return{headers:['REGISTRO','MÉTODO','SITUAÇÃO'],rows:fitRows(store.ndt.map(n=>[get(n.id),get(n.method),get(n.status||'PLANNED')]),table.maxRows),total:store.ndt.length};
 if(table.kind==='TML')return{headers:['PONTO','TIPO','ESPESSURA'],rows:fitRows(store.points.map(p=>{const mm=store.measurements.filter(m=>m.pointId===p.id).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];return[get(p.label||p.id),get(p.type),mm?get(String(mm.thickness)+' mm'):'SEM MEDIÇÃO']}),table.maxRows),total:store.points.length};
 if(table.kind==='REVISION'){const revisions=document.revisions||[];return{headers:['REV.','ESTADO','DATA'],rows:fitRows(revisions.map(r=>[get(r.revision),get(r.state),get(r.date?.slice(0,10)||'—')]),table.maxRows),total:revisions.length}}
 if(table.kind==='NOTES')return{headers:['NOTAS / OBSERVAÇÕES'],rows:fitRows(String(sheet?.titleBlock?.notes||'').split('\n').filter(Boolean).map(x=>[get(x)]),table.maxRows),total:String(sheet?.titleBlock?.notes||'').split('\n').filter(Boolean).length};
 if(table.kind==='MANUAL')return{headers:['DESCRIÇÃO','VALOR'],rows:fitRows(cleanRows(table.manualRows||[]),table.maxRows),total:table.manualRows.length};
 throw Error('Tipo de tabela inválido');
}
export function ux08ApplyPreset(d,sheetId,presetId,{preserveTitleBlock=true,template=null}={}){
 const preset=template||UX08_PRESETS.find(p=>p.id===presetId);if(!preset)throw Error('Template não localizado');
 let out=clone(d);const s=out.sheets.find(x=>x.id===sheetId);if(!s)throw Error('Folha não localizada');
 const tables=(preset.tables||[]).map((item,i)=>typeof item==='string'?ux08NewTable(item,'UX08-'+sheetId+'-'+item,{anchor:i===0?'TOP_LEFT':i===1?'BOTTOM_LEFT':'TOP_RIGHT'}):clone(item));
 out=ux08UpdateLayout(out,sheetId,{templateId:preset.id,style:preset.style,frame:preset.frame,titleBlock:preset.titleBlock||ux08DefaultLayout().titleBlock,tables});
 if(!preserveTitleBlock&&preset.dataFields)out=updateTitleBlock(out,sheetId,clone(preset.dataFields));
 return out;
}
export function ux08SaveTemplate(sheet,{id,name}){
 if(!/^[a-zA-Z0-9_-]{3,64}$/.test(String(id)))throw Error('ID de template inválido');
 if(UX08_PRESETS.some(p=>p.id===id))throw Error('Template reservado');
 if(!txt(name).trim()||String(name).length>80)throw Error('Nome inválido');
 const v=ux08ValidateSheet(sheet);if(!v.valid)throw Error(v.errors.join(','));
 const cfg=ux08Layout(sheet);
 return{id,name:txt(name,80),schema:UX08_SCHEMA,style:cfg.style,frame:cfg.frame,titleBlock:cfg.titleBlock,tables:cfg.tables,dataFields:Object.fromEntries(Object.entries(sheet.titleBlock||{}).map(([k,v])=>[k,txt(v,280)]))};
}
export function ux08ReadTemplates(raw){
 try{
  if(typeof raw!=='string'||raw.length>280000)throw Error('Tamanho inválido');
  const payload=JSON.parse(raw),templates=payload.templates;
  if(payload.schema!==UX08_SCHEMA||!Array.isArray(templates)||templates.length>25)throw Error('Schema inválido');
  const seen=new Set();return templates.map(t=>{
   if(!/^[a-zA-Z0-9_-]{3,64}$/.test(t.id)||seen.has(t.id)||UX08_PRESETS.some(p=>p.id===t.id)||!t.name||!['CORPORATE','FIELD','MINIMAL'].includes(t.style))throw Error('Template inválido');
   seen.add(t.id);const testSheet={format:'A3',orientation:'landscape',titleBlock:{},pageLayout:{...ux08DefaultLayout(),...t}};
   if(!ux08ValidateSheet(testSheet).valid)throw Error('Geometria inválida');
   return clone({id:t.id,name:txt(t.name,80),schema:UX08_SCHEMA,style:t.style,frame:t.frame,titleBlock:t.titleBlock,tables:t.tables||[],dataFields:t.dataFields||{}});
  });
 }catch{return[]}
}
export const ux08SerializeTemplates=templates=>JSON.stringify({schema:UX08_SCHEMA,templates:clone(templates)});
