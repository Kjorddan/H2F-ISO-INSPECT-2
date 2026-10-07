const freeze=o=>Object.freeze(o);
export const LIBRARY_CATEGORIES=freeze([
 'TUBULAÇÃO','CONEXÕES','FLANGES','VÁLVULAS','INSTRUMENTAÇÃO','SUPORTES','EQUIPAMENTOS','INSPEÇÃO','END','ANOTAÇÕES','SÍMBOLOS DE FOLHA'
]);
const D={width:72,height:46};
const def=(id,category,name,acronym,primitive='generic',extra={})=>freeze({id,category,name,acronym,tags:[],size:D,primitive,...extra});
export const BUILTIN_SYMBOLS=freeze([
 def('pipe-run','TUBULAÇÃO','Tubulação / Pipe Run','PIPE','pipe'),
 def('pipe-break','TUBULAÇÃO','Quebra de tubulação','BREAK','pipe-break'),
 def('flow-arrow','TUBULAÇÃO','Seta de fluxo','FLOW','flow'),

 def('elbow-90','CONEXÕES','Cotovelo 90°','EL90','elbow90'),def('elbow-45','CONEXÕES','Cotovelo 45°','EL45','elbow45'),
 def('tee','CONEXÕES','Tee','TEE','tee'),def('lateral','CONEXÕES','Lateral','LAT','lateral'),def('cross','CONEXÕES','Cruzeta','CRUZ','cross'),
 def('coupling','CONEXÕES','Luva','LUVA','coupling'),def('union','CONEXÕES','União','UNION','union'),def('cap','CONEXÕES','Cap','CAP','cap'),def('plug','CONEXÕES','Plug','PLUG','plug'),
 def('reducer','CONEXÕES','Redução','RED','reducer'),def('weldolet','CONEXÕES','Weldolet','WOL','olet'),def('sockolet','CONEXÕES','Sockolet','SOL','olet'),def('threadolet','CONEXÕES','Threadolet','TOL','olet'),def('olet-generic','CONEXÕES','Olet genérico','OLET','olet'),

 def('flange-wn','FLANGES','Flange Welding Neck','WN','flange'),def('flange-so','FLANGES','Flange Slip-On','SO','flange'),def('flange-sw','FLANGES','Flange Socket Weld','SW','flange'),
 def('flange-lj','FLANGES','Flange Lap Joint','LJ','flange'),def('flange-blind','FLANGES','Flange cego','BLIND','flange-blind'),def('flange-threaded','FLANGES','Flange roscado','THD','flange'),def('flange-pair','FLANGES','Par flangeado','PAIR','flange-pair'),

 def('valve-gate','VÁLVULAS','Válvula gaveta','VG','valve'),def('valve-globe','VÁLVULAS','Válvula globo','VGL','valve'),def('valve-ball','VÁLVULAS','Válvula esfera','VB','valve-ball'),
 def('valve-butterfly','VÁLVULAS','Válvula borboleta','VBF','valve-butterfly'),def('valve-check','VÁLVULAS','Válvula de retenção','VR','valve-check'),def('valve-needle','VÁLVULAS','Válvula agulha','VA','valve-needle'),
 def('valve-plug','VÁLVULAS','Válvula macho','VM','valve-plug'),def('valve-diaphragm','VÁLVULAS','Válvula diafragma','VD','valve-diaphragm'),def('valve-control','VÁLVULAS','Válvula de controle','CV','valve-control'),
 def('valve-safety','VÁLVULAS','Válvula de segurança','PSV','valve-relief'),def('valve-relief','VÁLVULAS','Válvula de alívio','PRV','valve-relief'),def('valve-generic','VÁLVULAS','Válvula genérica','V','valve'),

 def('inst-pi','INSTRUMENTAÇÃO','Pressure Indicator','PI','instrument',{instrumentCode:'PI'}),def('inst-pt','INSTRUMENTAÇÃO','Pressure Transmitter','PT','instrument',{instrumentCode:'PT'}),
 def('inst-ti','INSTRUMENTAÇÃO','Temperature Indicator','TI','instrument',{instrumentCode:'TI'}),def('inst-tt','INSTRUMENTAÇÃO','Temperature Transmitter','TT','instrument',{instrumentCode:'TT'}),
 def('inst-fi','INSTRUMENTAÇÃO','Flow Indicator','FI','instrument',{instrumentCode:'FI'}),def('inst-ft','INSTRUMENTAÇÃO','Flow Transmitter','FT','instrument',{instrumentCode:'FT'}),
 def('inst-li','INSTRUMENTAÇÃO','Level Indicator','LI','instrument',{instrumentCode:'LI'}),def('inst-lt','INSTRUMENTAÇÃO','Level Transmitter','LT','instrument',{instrumentCode:'LT'}),
 def('inst-generic','INSTRUMENTAÇÃO','Instrumento genérico','INST','instrument',{instrumentCode:'I'}),def('inst-local','INSTRUMENTAÇÃO','Instrumento local','LOCAL','instrument-local',{instrumentCode:'I'}),def('inst-transmitter','INSTRUMENTAÇÃO','Transmissor','TX','instrument-transmitter',{instrumentCode:'T'}),

 def('support-rest','SUPORTES','Apoio','REST','support'),def('support-guide','SUPORTES','Guia','GUIDE','support-guide'),def('support-anchor','SUPORTES','Âncora','ANCH','support-anchor'),def('support-shoe','SUPORTES','Shoe','SHOE','support-shoe'),
 def('support-hanger','SUPORTES','Hanger','HGR','support-hanger'),def('support-spring','SUPORTES','Spring','SPR','support-spring'),def('support-generic','SUPORTES','Suporte genérico','SUP','support'),def('support-special','SUPORTES','Suporte especial','ESP','support-special'),

 def('equip-vessel','EQUIPAMENTOS','Vaso','VESSEL','vessel',{size:{width:92,height:64}}),def('equip-tank','EQUIPAMENTOS','Tanque','TANK','tank',{size:{width:92,height:64}}),def('equip-pump','EQUIPAMENTOS','Bomba','PUMP','pump'),
 def('equip-compressor','EQUIPAMENTOS','Compressor','COMP','compressor'),def('equip-exchanger','EQUIPAMENTOS','Trocador de calor','HX','exchanger',{size:{width:100,height:54}}),def('equip-column','EQUIPAMENTOS','Coluna','COL','column',{size:{width:56,height:100}}),
 def('equip-furnace','EQUIPAMENTOS','Forno','FURN','furnace'),def('equip-filter','EQUIPAMENTOS','Filtro','FILTER','filter'),def('equip-reactor','EQUIPAMENTOS','Reator','REACT','reactor'),def('equip-generic','EQUIPAMENTOS','Equipamento genérico','EQ','equipment'),def('equip-nozzle','EQUIPAMENTOS','Nozzle','NOZ','nozzle'),

 def('insp-tml','INSPEÇÃO','Ponto TML/CML','TML','inspection-point'),def('insp-weld','INSPEÇÃO','Solda','WELD','weld'),def('insp-anomaly','INSPEÇÃO','Anomalia','ANOM','anomaly'),def('insp-evidence','INSPEÇÃO','Evidência','EVID','evidence'),
 def('ndt-ut','END','Ultrassom','UT','ndt'),def('ndt-pt','END','Líquido penetrante','PT-END','ndt'),def('ndt-mt','END','Partículas magnéticas','MT','ndt'),def('ndt-rt','END','Radiografia','RT','ndt'),def('ndt-etr','END','Correntes parasitas','ECT','ndt'),def('ndt-iris','END','IRIS','IRIS','ndt'),def('ndt-mfl','END','MFL','MFL','ndt'),

 def('ann-text','ANOTAÇÕES','Texto','TXT','annotation'),def('ann-leader','ANOTAÇÕES','Leader','LEADER','leader'),def('ann-condition','ANOTAÇÕES','Nota de condição','COND','condition'),def('ann-offset','ANOTAÇÕES','Offset','OFFSET','offset'),
 def('sheet-north','SÍMBOLOS DE FOLHA','Norte','N','north'),def('sheet-continuation','SÍMBOLOS DE FOLHA','Continuidade','CONT','continuation'),def('sheet-coordinate','SÍMBOLOS DE FOLHA','Coordenada industrial','COORD','coordinate'),def('sheet-elevation','SÍMBOLOS DE FOLHA','Elevação','EL','elevation'),def('sheet-revision','SÍMBOLOS DE FOLHA','Revisão','REV','revision')
]);
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function validateLibrary(symbols=BUILTIN_SYMBOLS){
 const issues=[],ids=new Set();
 for(const c of LIBRARY_CATEGORIES)if(!symbols.some(s=>s.category===c))issues.push(`empty-category:${c}`);
 for(const s of symbols){if(!s.id||!s.name||!s.category)issues.push(`invalid:${s.id||'unknown'}`);if(ids.has(s.id))issues.push(`duplicate:${s.id}`);ids.add(s.id);if(!LIBRARY_CATEGORIES.includes(s.category))issues.push(`unknown-category:${s.id}`)}
 return{valid:issues.length===0,issues,count:symbols.length,categories:LIBRARY_CATEGORIES.length};
}
export function searchLibrary(symbols=BUILTIN_SYMBOLS,{query='',category='TODAS',favorites=[]}={}){
 const q=normalize(query),fav=new Set(favorites);
 return symbols.filter(s=>{
  if(category==='FAVORITOS'&&!fav.has(s.id))return false;
  if(category!=='TODAS'&&category!=='FAVORITOS'&&s.category!==category)return false;
  if(!q)return true;
  return [s.name,s.category,s.acronym,s.id,...(s.tags||[])].some(v=>normalize(v).includes(q));
 });
}
export function toggleFavorite(favorites=[],symbolId){const set=new Set(favorites);set.has(symbolId)?set.delete(symbolId):set.add(symbolId);return[...set];}
export function pushRecent(recents=[],symbolId,max=12){return[symbolId,...recents.filter(x=>x!==symbolId)].slice(0,max);}
export function createSymbolEntity(symbolId,point,options={}){
 const s=BUILTIN_SYMBOLS.find(x=>x.id===symbolId);if(!s)throw new Error(`Unknown symbol: ${symbolId}`);return createSymbolEntityFrom(s,point,options);
}
export function defaultSymbolPorts(symbol,width,height){
 if(symbol.id==='tee')return[{id:'P1',x:0,y:height/2,role:'main-in'},{id:'P2',x:width,y:height/2,role:'main-out'},{id:'P3',x:width/2,y:0,role:'branch'}];
 if(['VÁLVULAS','CONEXÕES','FLANGES'].includes(symbol.category))return[{id:'P1',x:0,y:height/2,role:'process'},{id:'P2',x:width,y:height/2,role:'process'}];
 if(symbol.id==='equip-nozzle')return[{id:'P1',x:0,y:height/2,role:'equipment'}];
 return[];
}
export const getSymbol=id=>BUILTIN_SYMBOLS.find(s=>s.id===id)||null;
export function libraryStats(symbols=BUILTIN_SYMBOLS){return{symbols:symbols.length,categories:LIBRARY_CATEGORIES.length,byCategory:Object.fromEntries(LIBRARY_CATEGORIES.map(c=>[c,symbols.filter(s=>s.category===c).length]))};}

export const LIBRARY_SCOPES=Object.freeze(['CORPORATE','TENANT','PROJECT','USER']);
export const SYMBOL_PRIMITIVES=Object.freeze(['line','polyline','arc','circle','ellipse','rectangle','polygon','text']);
export function createCustomSymbol({id,name,category='ANOTAÇÕES',acronym='',scope='USER',primitives=[],connectionPoints=[],version=1}={}){
 if(!id||!name)throw new Error('Custom symbol requires id and name');if(!LIBRARY_CATEGORIES.includes(category))throw new Error('Invalid category');if(!LIBRARY_SCOPES.includes(scope))throw new Error('Invalid scope');
 for(const p of primitives)if(!SYMBOL_PRIMITIVES.includes(p.type))throw new Error(`Invalid primitive: ${p.type}`);
 return{id:String(id),name:String(name),category,acronym:String(acronym||name.slice(0,4)).toUpperCase(),tags:['custom'],size:{...D},primitive:'custom',custom:true,scope,version:Number(version)||1,primitives:structuredClone(primitives),connectionPoints:structuredClone(connectionPoints)};
}
export function addSymbolPrimitive(symbol,primitive){if(!symbol?.custom)throw new Error('Custom symbol required');if(!SYMBOL_PRIMITIVES.includes(primitive?.type))throw new Error('Invalid primitive');return{...symbol,primitives:[...symbol.primitives,structuredClone(primitive)]};}
export function addCustomConnectionPoint(symbol,point){if(!symbol?.custom)throw new Error('Custom symbol required');const cp={id:point.id||`CP${symbol.connectionPoints.length+1}`,x:Number(point.x),y:Number(point.y),role:point.role||'process'};return{...symbol,connectionPoints:[...symbol.connectionPoints,cp]};}
export function versionCustomSymbol(symbol,patch={}){if(!symbol?.custom)throw new Error('Custom symbol required');return{...symbol,...patch,version:(symbol.version||1)+1,primitives:structuredClone(patch.primitives||symbol.primitives),connectionPoints:structuredClone(patch.connectionPoints||symbol.connectionPoints)};}
export function exportCustomLibrary(symbols=[]){return JSON.stringify({format:'h2f-symbol-library',schemaVersion:1,symbols:symbols.filter(s=>s.custom)},null,2);}
export function importCustomLibrary(text){const data=JSON.parse(text);if(data?.format!=='h2f-symbol-library'||data.schemaVersion!==1||!Array.isArray(data.symbols))throw new Error('Invalid H2F symbol library');return data.symbols.map(createCustomSymbol);}
export function createSymbolEntityFrom(symbol,point,{id,rotation=0,tag=''}={}){if(!symbol)throw new Error('Symbol required');const width=symbol.size?.width||D.width,height=symbol.size?.height||D.height;const ports=symbol.custom?symbol.connectionPoints.map(p=>({...p})):defaultSymbolPorts(symbol,width,height);return{id:id||`SYM-${symbol.id}`,kind:'industrial-symbol',symbolId:symbol.id,category:symbol.category,name:symbol.name,acronym:symbol.acronym,tag:String(tag||''),x:Number(point.x)-width/2,y:Number(point.y)-height/2,width,height,rotation:Number(rotation)||0,ports};}
