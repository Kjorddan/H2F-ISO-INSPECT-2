import{sheetSize,revisionPayload,sha256}from'./document-structure.js';
import{ux08Layout,ux08ValidateSheet,ux08TableData}from'./ux08-sheet-layout.js';
export const UX09_SCHEMA='h2f-print-release/v1';
export const UX09_STATES=Object.freeze(['RASCUNHO','EM ELABORAÇÃO','EM REVISÃO','REVISADO','APROVADO','AS BUILT']);
export const UX09_MAX_PAGES=200;
const safe=s=>String(s??'').replace(/[\u0000-\u001f\u007f\/\\:*?"<>|]/g,'_').slice(0,100);
export const ux09DefaultOptions=()=>({scope:'ALL_SHEETS',includeTableContinuations:true,documentMode:'PREVIEW',includeIndex:false,fileBase:'H2F_ISO_INSPECT'});
export const ux09ScopedEntities=(entities=[],sheet)=>entities.filter(e=>e?.category!=='SÍMBOLOS DE FOLHA'||(e.ux06?.sheetId||e.sheetId)===sheet.id);
export const ux09AvailableScopes=Object.freeze(['CURRENT_SHEET','ALL_SHEETS']);
export function ux09ValidateOptions(options={}){
 const errors=[];
 if(!ux09AvailableScopes.includes(options.scope))errors.push('scope');
 if(!['PREVIEW','CONTROLLED'].includes(options.documentMode))errors.push('mode');
 if(typeof options.includeTableContinuations!=='boolean')errors.push('continuations');
 return{valid:!errors.length,errors};
}
export function ux09AllTableRows(t,context){
 const full={...t,maxRows:1e8};
 return ux08TableData(full,context);
}
export function ux09BuildPlan({document,entities=[],inspection={},options={}}={}){
 if(!document?.sheets?.length)throw Error('Documento sem folhas');
 const cfg={...ux09DefaultOptions(),...options};
 const valid=ux09ValidateOptions(cfg);if(!valid.valid)throw Error('Opções de impressão inválidas: '+valid.errors.join(','));
 const included=cfg.scope==='CURRENT_SHEET'?document.sheets.filter(s=>s.id===document.activeSheetId):document.sheets;
 if(!included.length)throw Error('Folha atual indisponível');
 const pages=[],warnings=[];
 for(const sheet of included){
  const chk=ux08ValidateSheet(sheet);if(!chk.valid)throw Error('Folha inválida '+sheet.id+': '+chk.errors.join(','));
  const size=sheetSize(sheet),scoped=ux09ScopedEntities(entities,sheet);
  const layout=ux08Layout(sheet);
  const overflow=[];
  for(const t of layout.tables.filter(t=>t.visible!==false)){
   const data=ux09AllTableRows(t,{sheet,entities:scoped,inspection,document});
   if(data.total>t.maxRows){
    if(!cfg.includeTableContinuations)warnings.push('Tabela '+t.title+' possui '+(data.total-t.maxRows)+' linha(s) fora da folha '+sheet.name+'.');
    else{
     const extras=data.rows.slice(t.maxRows);
     const chunkSize=Math.max(1,Math.min(15,t.maxRows));
     for(let i=0;i<extras.length;i+=chunkSize)overflow.push({kind:'TABLE_CONTINUATION',sheetId:sheet.id,tableId:t.id,tableTitle:t.title,tableKind:t.kind,rows:extras.slice(i,i+chunkSize),headers:data.headers,fromRow:t.maxRows+i+1,toRow:t.maxRows+Math.min(i+chunkSize,extras.length),totalRows:data.total});
    }
   }
  }
  pages.push({kind:'SHEET',sheetId:sheet.id,sourceSheetName:sheet.name,sizeMm:size,title:sheet.titleBlock?.title||sheet.name,revision:sheet.titleBlock?.revision||'0',layoutId:layout.templateId,visibleEntities:scoped.map(e=>e.id)});
  for(const p of overflow)pages.push({...p,sourceSheetName:sheet.name,sizeMm:size,title:sheet.titleBlock?.title||sheet.name,revision:sheet.titleBlock?.revision||'0'});
 }
 if(pages.length>UX09_MAX_PAGES)throw Error('Limite de '+UX09_MAX_PAGES+' páginas excedido');
 const collisions=ux09LayoutWarnings(included);
 warnings.push(...collisions);
 return{schema:UX09_SCHEMA,pages:pages.map((p,i)=>({...p,pageIndex:i+1,pageCount:pages.length,documentMode:cfg.documentMode})),warnings,mode:cfg.documentMode,scope:cfg.scope,sourceSheetCount:included.length,totalPageCount:pages.length};
}
export function ux09LayoutWarnings(sheets){
 const warnings=[];
 for(const s of sheets){const layout=ux08Layout(s);
  if(layout.tables.filter(t=>t.visible!==false&&t.anchor==='BOTTOM_RIGHT').length>0&&layout.titleBlock.visible)warnings.push('Tabela no canto inferior direito pode sobrepor carimbo: '+s.name);
  for(const anchor of ['TOP_LEFT','TOP_RIGHT','BOTTOM_LEFT','BOTTOM_RIGHT']){
   if(layout.tables.filter(t=>t.visible!==false&&t.anchor===anchor).length>2)warnings.push('Três ou mais tabelas na mesma âncora podem se sobrepor: '+s.name+' '+anchor);
  }
 }
 return warnings;
}
export function ux09FileName(document,plan,{controlled=false}={}){
 const title=safe(document?.name||'ISOMETRICO'),revision=safe(document?.sheets?.find(s=>s.id===document.activeSheetId)?.titleBlock?.revision||'0');
 return ['H2F',title,'REV-'+revision,controlled?'EMISSAO':'PREVIA',plan.scope==='CURRENT_SHEET'?'FOLHA':'COMPLETO'].join('_')+'.pdf';
}
export async function ux09VerifyControlled(document,entities=[]){
 if(!['APROVADO','AS BUILT'].includes(document?.revisionState))return{allowed:false,reason:'Estado documental deve ser APROVADO ou AS BUILT'};
 const latest=[...(document.revisions||[])].at(-1);
 if(!latest?.immutable||!latest.sha256)return{allowed:false,reason:'Snapshot formal imutável com SHA-256 é obrigatório'};
 if(latest.state!==document.revisionState)return{allowed:false,reason:'O snapshot não corresponde ao estado de revisão atual'};
 const digest=await sha256(revisionPayload(document,entities));
 if(digest!==latest.sha256)return{allowed:false,reason:'O documento mudou após o snapshot: crie uma nova revisão formal'};
 return{allowed:true,snapshotId:latest.id,digest,revision:latest.revision,state:latest.state};
}
export function ux09EmissionAttempt({plan,gate,fileName,now=new Date().toISOString()}={}){
 if(!gate?.allowed||!plan?.pages?.length||!fileName)throw Error('Emissão controlada bloqueada: aprovação e documento íntegro obrigatórios');
 return{id:'UX09-'+Date.parse(now)+'-'+String(gate.digest).slice(0,10),schema:UX09_SCHEMA,createdAt:now,state:'DOWNLOAD_SOLICITADO_NAO_ASSINADO',fileName,revision:gate.revision,revisionState:gate.state,sha256:gate.digest,snapshotId:gate.snapshotId,pageCount:plan.pages.length};
}
export function ux09PrintHtml(pagesSvg,plan){
 if(!Array.isArray(pagesSvg)||pagesSvg.length!==plan.pages.length)throw Error('Páginas SVG divergentes do plano');
 const pieces=pagesSvg.map((svg,i)=>{
  const p=plan.pages[i],w=p.sizeMm.width,h=p.sizeMm.height;
  return '<section class="h2fPage" data-page="'+(i+1)+'" style="width:'+w+'mm;height:'+h+'mm">'+svg+'</section>';
 });
 return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>H2F ISO INSPECT — Impressão</title><style>html,body{margin:0;padding:0;background:white}.h2fPage{page-break-after:always;break-after:page;overflow:hidden}.h2fPage:last-child{page-break-after:auto;break-after:auto}svg{width:100%;height:100%;display:block}@media print{@page{size:auto;margin:0}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+pieces.join('')+'</body></html>';
}
