const freeze=o=>Object.freeze(o);
export const LIBRARY_SCHEMA_VERSION=2;
export const LIBRARY_CATEGORIES=freeze([
 'TUBULAÇÃO','CONEXÕES','FLANGES','VÁLVULAS','INSTRUMENTAÇÃO','SUPORTES','EQUIPAMENTOS','INSPEÇÃO','END','ANOTAÇÕES','SÍMBOLOS DE FOLHA'
]);
export const USAGE_CONTEXTS=freeze(['ISOMETRIC','P&ID','INSPECTION','NDT','SHEET','ANNOTATION']);
export const PLACEMENT_MODES=freeze(['DRAW','INLINE','JUNCTION','TERMINAL','ATTACHED','FREE','SHEET']);
export const NORMATIVE_STATUS=freeze(['REFERENCE_GUIDED','PROJECT_DEFINED','VALIDATED']);
const D={width:72,height:46};
const refs={
 piping:['ISO 6412-2:2017 — contexto de representação isométrica; símbolo H2F sujeito à prática/especificação do projeto'],
 instrumentation:['ANSI/ISA-5.1-2024 — contexto de identificação e simbologia de instrumentação'],
 supports:['MSS SP-58 — referência de terminologia/classificação de suportes; representação gráfica H2F sujeita à prática do projeto'],
 inspection:['API RP 574 — contexto de inspeção de componentes de sistemas de tubulação'],
 ndt:['ASME BPVC Section V — contexto de métodos END; representação gráfica H2F não implica símbolo normativo'],
 sheet:['ISO 6412-2:2017 — contexto de documentação isométrica'],
 annotation:['H2F ISO INSPECT — convenção documental interna']
};
const categoryProfile={
 'TUBULAÇÃO':{usageContexts:['ISOMETRIC'],technicalReferences:refs.piping,subcategory:'TRAJETÓRIA'},
 'CONEXÕES':{usageContexts:['ISOMETRIC'],technicalReferences:refs.piping,subcategory:'FITTING'},
 'FLANGES':{usageContexts:['ISOMETRIC'],technicalReferences:refs.piping,subcategory:'FLANGE'},
 'VÁLVULAS':{usageContexts:['ISOMETRIC'],technicalReferences:refs.piping,subcategory:'VALVE'},
 'INSTRUMENTAÇÃO':{usageContexts:['ISOMETRIC','P&ID'],technicalReferences:refs.instrumentation,subcategory:'INSTRUMENT'},
 'SUPORTES':{usageContexts:['ISOMETRIC'],technicalReferences:refs.supports,subcategory:'PIPE_SUPPORT'},
 'EQUIPAMENTOS':{usageContexts:['ISOMETRIC'],technicalReferences:refs.piping,subcategory:'EQUIPMENT'},
 'INSPEÇÃO':{usageContexts:['ISOMETRIC','INSPECTION'],technicalReferences:refs.inspection,subcategory:'INSPECTION'},
 'END':{usageContexts:['ISOMETRIC','INSPECTION','NDT'],technicalReferences:refs.ndt,subcategory:'NDT'},
 'ANOTAÇÕES':{usageContexts:['ISOMETRIC','ANNOTATION'],technicalReferences:refs.annotation,subcategory:'ANNOTATION'},
 'SÍMBOLOS DE FOLHA':{usageContexts:['ISOMETRIC','SHEET'],technicalReferences:refs.sheet,subcategory:'SHEET'}
};
const TWO_INLINE=new Set([
 'elbow-90','elbow-45','coupling','union','reducer',
 'flange-wn','flange-so','flange-sw','flange-lj','flange-threaded','flange-pair',
 'valve-gate','valve-globe','valve-ball','valve-butterfly','valve-check','valve-needle','valve-plug','valve-diaphragm','valve-control','valve-safety','valve-relief','valve-generic'
]);
const BRANCH=new Set(['tee','lateral','cross']);
const TERMINAL=new Set(['cap','plug','flange-blind']);
const OLETS=new Set(['weldolet','sockolet','threadolet','olet-generic']);
const port=(id,u,v,role='process',direction='bidirectional')=>({id,u,v,role,direction});
function portDefinitionsFor(id){
 if(id==='tee')return[port('P1',0,.5,'main-in'),port('P2',1,.5,'main-out'),port('P3',.5,0,'branch')];
 if(id==='lateral')return[port('P1',0,.5,'main-in'),port('P2',1,.5,'main-out'),port('P3',.7,0,'branch')];
 if(id==='cross')return[port('P1',0,.5,'main'),port('P2',1,.5,'main'),port('P3',.5,0,'branch'),port('P4',.5,1,'branch')];
 if(TERMINAL.has(id))return[port('P1',0,.5,'terminal')];
 if(OLETS.has(id))return[port('P1',.5,.5,'host'),port('P2',.5,0,'branch')];
 if(TWO_INLINE.has(id))return[port('P1',0,.5,'process'),port('P2',1,.5,'process')];
 if(id==='equip-nozzle')return[port('P1',0,.5,'equipment')];
 return[];
}
function placementFor(id,category){
 if(id==='pipe-run')return{modes:['DRAW'],inline:false,junction:false,terminal:false,attached:false,free:false};
 if(BRANCH.has(id))return{modes:['JUNCTION','FREE'],inline:false,junction:true,terminal:false,attached:false,free:true};
 if(TERMINAL.has(id))return{modes:['TERMINAL','FREE'],inline:false,junction:false,terminal:true,attached:false,free:true};
 if(OLETS.has(id))return{modes:['ATTACHED','FREE'],inline:false,junction:false,terminal:false,attached:true,free:true};
 if(TWO_INLINE.has(id))return{modes:['INLINE','FREE'],inline:true,junction:false,terminal:false,attached:false,free:true};
 if(['SUPORTES','INSTRUMENTAÇÃO','INSPEÇÃO','END'].includes(category))return{modes:['ATTACHED','FREE'],inline:false,junction:false,terminal:false,attached:true,free:true};
 if(category==='SÍMBOLOS DE FOLHA')return{modes:['SHEET','FREE'],inline:false,junction:false,terminal:false,attached:false,free:true};
 return{modes:['FREE'],inline:false,junction:false,terminal:false,attached:false,free:true};
}
function snapPolicyFor(category,placement){
 return{
  grid:true,
  ports:!!(placement.inline||placement.junction||placement.terminal),
  endpoint:['CONEXÕES','FLANGES','VÁLVULAS','EQUIPAMENTOS'].includes(category),
  vertex:['CONEXÕES','FLANGES','VÁLVULAS','SUPORTES','INSPEÇÃO','END'].includes(category),
  midpoint:['SUPORTES','INSPEÇÃO','END','INSTRUMENTAÇÃO'].includes(category),
  alignment:true
 };
}
function subcategoryFor(id,category,primitive){
 if(OLETS.has(id))return'BRANCH_OUTLET';
 if(BRANCH.has(id))return'BRANCH_FITTING';
 if(TERMINAL.has(id))return'TERMINAL';
 if(id.startsWith('elbow'))return'CHANGE_OF_DIRECTION';
 if(id==='reducer')return'REDUCER';
 if(id.startsWith('flange-'))return'FLANGE';
 if(id.startsWith('valve-'))return'VALVE';
 if(id.startsWith('support-'))return'PIPE_SUPPORT';
 if(id.startsWith('equip-'))return'EQUIPMENT';
 if(id.startsWith('inst-'))return'INSTRUMENT';
 if(id.startsWith('insp-'))return'INSPECTION';
 if(id.startsWith('ndt-'))return'NDT';
 return categoryProfile[category]?.subcategory||String(primitive||'GENERIC').toUpperCase();
}
function builtInMeta(id,category,name,primitive){
 const profile=categoryProfile[category]||{usageContexts:['ISOMETRIC'],technicalReferences:[],subcategory:'GENERAL'};
 const placement=placementFor(id,category);
 return{
  schemaVersion:LIBRARY_SCHEMA_VERSION,
  subcategory:subcategoryFor(id,category,primitive),
  description:`${name} — símbolo H2F para uso técnico no contexto ${profile.usageContexts.join('/')}`,
  usageContexts:[...profile.usageContexts],
  technicalReferences:[...profile.technicalReferences],
  normativeStatus:'REFERENCE_GUIDED',
  h2fCustom:true,
  provenance:{type:'H2F_BUILTIN',status:'TECHNICAL_REVIEW_REQUIRED',source:'H2F ISO INSPECT'},
  placement,
  snapPolicy:snapPolicyFor(category,placement),
  portDefinitions:portDefinitionsFor(id)
 };
}
const def=(id,category,name,acronym,primitive='generic',extra={})=>{
 const meta=builtInMeta(id,category,name,primitive);
 return freeze({id,category,name,acronym,tags:[],size:D,primitive,...meta,...extra});
};
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
export function validateSymbolDefinition(s){
 const issues=[];
 if(!s?.id||!s?.name||!s?.category)issues.push('identity');
 if(!LIBRARY_CATEGORIES.includes(s?.category))issues.push('category');
 if(!s?.subcategory)issues.push('subcategory');
 if(!s?.description)issues.push('description');
 if(!Array.isArray(s?.usageContexts)||!s.usageContexts.length||s.usageContexts.some(x=>!USAGE_CONTEXTS.includes(x)))issues.push('usage-contexts');
 if(!Array.isArray(s?.technicalReferences))issues.push('technical-references');
 if(!NORMATIVE_STATUS.includes(s?.normativeStatus))issues.push('normative-status');
 if(typeof s?.h2fCustom!=='boolean')issues.push('h2f-custom-flag');
 if(!s?.placement||!Array.isArray(s.placement.modes)||!s.placement.modes.length||s.placement.modes.some(x=>!PLACEMENT_MODES.includes(x)))issues.push('placement');
 if(!s?.snapPolicy||['grid','ports','endpoint','vertex','midpoint','alignment'].some(k=>typeof s.snapPolicy[k]!=='boolean'))issues.push('snap-policy');
 if(!Array.isArray(s?.portDefinitions))issues.push('port-definitions');
 else{
  const ids=new Set();
  for(const p of s.portDefinitions){
   if(!p.id||ids.has(p.id)||!Number.isFinite(p.u)||!Number.isFinite(p.v)||p.u<0||p.u>1||p.v<0||p.v>1)issues.push('invalid-port');
   ids.add(p.id);
  }
 }
 if(s?.placement?.inline&&s.portDefinitions.length!==2)issues.push('inline-port-count');
 if(s?.placement?.junction&&s.portDefinitions.length<3)issues.push('junction-port-count');
 if(s?.placement?.terminal&&s.portDefinitions.length!==1)issues.push('terminal-port-count');
 return{valid:issues.length===0,issues};
}
export function validateLibrary(symbols=BUILTIN_SYMBOLS){
 const issues=[],ids=new Set();
 for(const c of LIBRARY_CATEGORIES)if(!symbols.some(s=>s.category===c))issues.push(`empty-category:${c}`);
 for(const s of symbols){
  const result=validateSymbolDefinition(s);
  if(!result.valid)for(const issue of result.issues)issues.push(`${issue}:${s.id||'unknown'}`);
  if(ids.has(s.id))issues.push(`duplicate:${s.id}`);ids.add(s.id);
 }
 return{valid:issues.length===0,issues,count:symbols.length,categories:LIBRARY_CATEGORIES.length,schemaVersion:LIBRARY_SCHEMA_VERSION};
}
export function searchLibrary(symbols=BUILTIN_SYMBOLS,{query='',category='TODAS',favorites=[]}={}){
 const q=normalize(query),fav=new Set(favorites);
 return symbols.filter(s=>{
  if(category==='FAVORITOS'&&!fav.has(s.id))return false;
  if(category!=='TODAS'&&category!=='FAVORITOS'&&s.category!==category)return false;
  if(!q)return true;
  return [s.name,s.category,s.subcategory,s.description,s.acronym,s.id,...(s.tags||[]),...(s.usageContexts||[]),...(s.technicalReferences||[])].some(v=>normalize(v).includes(q));
 });
}
export function toggleFavorite(favorites=[],symbolId){const set=new Set(favorites);set.has(symbolId)?set.delete(symbolId):set.add(symbolId);return[...set];}
export function pushRecent(recents=[],symbolId,max=12){return[symbolId,...recents.filter(x=>x!==symbolId)].slice(0,max);}
export function createSymbolEntity(symbolId,point,options={}){
 const s=BUILTIN_SYMBOLS.find(x=>x.id===symbolId);if(!s)throw new Error(`Unknown symbol: ${symbolId}`);return createSymbolEntityFrom(s,point,options);
}
export function defaultSymbolPorts(symbol,width,height){
 return(symbol?.portDefinitions||[]).map(p=>({id:p.id,x:p.u*width,y:p.v*height,role:p.role||'process',direction:p.direction||'bidirectional'}));
}
export const getSymbol=id=>BUILTIN_SYMBOLS.find(s=>s.id===id)||null;
export function libraryStats(symbols=BUILTIN_SYMBOLS){
 return{
  schemaVersion:LIBRARY_SCHEMA_VERSION,
  symbols:symbols.length,
  categories:LIBRARY_CATEGORIES.length,
  byCategory:Object.fromEntries(LIBRARY_CATEGORIES.map(c=>[c,symbols.filter(s=>s.category===c).length])),
  byContext:Object.fromEntries(USAGE_CONTEXTS.map(ctx=>[ctx,symbols.filter(s=>s.usageContexts?.includes(ctx)).length])),
  inline:symbols.filter(s=>s.placement?.inline).length,
  junction:symbols.filter(s=>s.placement?.junction).length,
  terminal:symbols.filter(s=>s.placement?.terminal).length,
  technicalReviewRequired:symbols.filter(s=>s.provenance?.status==='TECHNICAL_REVIEW_REQUIRED').length
 };
}
export function buildLibraryValidationMatrix(symbols=BUILTIN_SYMBOLS){
 return symbols.map(s=>({
  id:s.id,category:s.category,subcategory:s.subcategory,name:s.name,
  usageContexts:[...(s.usageContexts||[])],
  useInIsometric:s.usageContexts?.includes('ISOMETRIC')||false,
  useInPid:s.usageContexts?.includes('P&ID')||false,
  useInInspection:s.usageContexts?.includes('INSPECTION')||false,
  useInNdt:s.usageContexts?.includes('NDT')||false,
  technicalReferences:[...(s.technicalReferences||[])],
  normativeStatus:s.normativeStatus,
  h2fCustom:s.h2fCustom,
  placementModes:[...(s.placement?.modes||[])],
  inline:!!s.placement?.inline,
  rotatable:true,
  snapPolicy:{...(s.snapPolicy||{})},
  connectionPoints:(s.portDefinitions||[]).map(p=>({id:p.id,role:p.role,direction:p.direction,u:p.u,v:p.v})),
  reviewStatus:s.provenance?.status||'UNKNOWN'
 }));
}

export const LIBRARY_SCOPES=Object.freeze(['CORPORATE','TENANT','PROJECT','USER']);
export const SYMBOL_PRIMITIVES=Object.freeze(['line','polyline','arc','circle','ellipse','rectangle','polygon','text']);
export function createCustomSymbol({
 id,name,category='ANOTAÇÕES',subcategory='CUSTOM',acronym='',scope='USER',primitives=[],connectionPoints=[],version=1,
 description='',usageContexts=['ISOMETRIC'],technicalReferences=[],normativeStatus='PROJECT_DEFINED',placement,snapPolicy
}={}){
 if(!id||!name)throw new Error('Custom symbol requires id and name');
 if(!LIBRARY_CATEGORIES.includes(category))throw new Error('Invalid category');
 if(!LIBRARY_SCOPES.includes(scope))throw new Error('Invalid scope');
 if(!Array.isArray(usageContexts)||usageContexts.some(x=>!USAGE_CONTEXTS.includes(x)))throw new Error('Invalid usage context');
 if(!NORMATIVE_STATUS.includes(normativeStatus))throw new Error('Invalid normative status');
 for(const p of primitives)if(!SYMBOL_PRIMITIVES.includes(p.type))throw new Error(`Invalid primitive: ${p.type}`);
 const customPlacement=placement||{modes:['FREE'],inline:false,junction:false,terminal:false,attached:false,free:true};
 const customSnap=snapPolicy||snapPolicyFor(category,customPlacement);
 return{
  schemaVersion:LIBRARY_SCHEMA_VERSION,id:String(id),name:String(name),category,subcategory:String(subcategory||'CUSTOM'),
  description:String(description||`${name} — símbolo customizado`),acronym:String(acronym||name.slice(0,4)).toUpperCase(),
  tags:['custom'],size:{...D},primitive:'custom',custom:true,h2fCustom:true,scope,version:Number(version)||1,
  usageContexts:[...usageContexts],technicalReferences:[...technicalReferences],normativeStatus,
  provenance:{type:'CUSTOM',status:'PROJECT_DEFINED',source:scope},placement:{...customPlacement},snapPolicy:{...customSnap},
  portDefinitions:[],primitives:structuredClone(primitives),connectionPoints:structuredClone(connectionPoints)
 };
}
export function addSymbolPrimitive(symbol,primitive){if(!symbol?.custom)throw new Error('Custom symbol required');if(!SYMBOL_PRIMITIVES.includes(primitive?.type))throw new Error('Invalid primitive');return{...symbol,primitives:[...symbol.primitives,structuredClone(primitive)]};}
export function addCustomConnectionPoint(symbol,point){if(!symbol?.custom)throw new Error('Custom symbol required');const cp={id:point.id||`CP${symbol.connectionPoints.length+1}`,x:Number(point.x),y:Number(point.y),role:point.role||'process',direction:point.direction||'bidirectional'};return{...symbol,connectionPoints:[...symbol.connectionPoints,cp]};}
export function versionCustomSymbol(symbol,patch={}){if(!symbol?.custom)throw new Error('Custom symbol required');return{...symbol,...patch,version:(symbol.version||1)+1,primitives:structuredClone(patch.primitives||symbol.primitives),connectionPoints:structuredClone(patch.connectionPoints||symbol.connectionPoints)};}
export function exportCustomLibrary(symbols=[]){return JSON.stringify({format:'h2f-symbol-library',schemaVersion:LIBRARY_SCHEMA_VERSION,symbols:symbols.filter(s=>s.custom)},null,2);}
export function importCustomLibrary(text){
 const data=JSON.parse(text);
 if(data?.format!=='h2f-symbol-library'||![1,LIBRARY_SCHEMA_VERSION].includes(data.schemaVersion)||!Array.isArray(data.symbols))throw new Error('Invalid H2F symbol library');
 return data.symbols.map(s=>createCustomSymbol({
  ...s,
  subcategory:s.subcategory||'CUSTOM',
  description:s.description||`${s.name} — símbolo migrado da biblioteca v${data.schemaVersion}`,
  usageContexts:s.usageContexts||['ISOMETRIC'],
  technicalReferences:s.technicalReferences||[],
  normativeStatus:s.normativeStatus||'PROJECT_DEFINED'
 }));
}
export function createSymbolEntityFrom(symbol,point,{id,rotation=0,tag=''}={}){
 if(!symbol)throw new Error('Symbol required');
 const width=symbol.size?.width||D.width,height=symbol.size?.height||D.height;
 const ports=symbol.custom?symbol.connectionPoints.map(p=>({...p})):defaultSymbolPorts(symbol,width,height);
 return{
  id:id||`SYM-${symbol.id}`,kind:'industrial-symbol',symbolId:symbol.id,category:symbol.category,subcategory:symbol.subcategory,
  name:symbol.name,acronym:symbol.acronym,tag:String(tag||''),x:Number(point.x)-width/2,y:Number(point.y)-height/2,width,height,rotation:Number(rotation)||0,
  ports,usageContexts:[...(symbol.usageContexts||[])],placement:{...(symbol.placement||{})},snapPolicy:{...(symbol.snapPolicy||{})},
  libraryMeta:{schemaVersion:symbol.schemaVersion||LIBRARY_SCHEMA_VERSION,normativeStatus:symbol.normativeStatus,h2fCustom:!!symbol.h2fCustom,provenance:structuredClone(symbol.provenance||{})}
 };
}
