import{BUILTIN_SYMBOLS,LIBRARY_SCOPES,SYMBOL_PRIMITIVES,createCustomSymbol,importCustomLibrary,exportCustomLibrary}from'./library.js';
// UX-07: all geometry is local to a 72 x 46 user-defined symbol viewport; no executable SVG/HTML.
export const UX07_BOUNDS=Object.freeze({width:72,height:46});
export const UX07_MAX_SYMBOLS=250;
export const UX07_MAX_PRIMITIVES=96;
export const UX07_MAX_PORTS=16;
export const UX07_STORAGE_KEY='h2f.iso.customShapes.ux07.v1';
export const UX07_ALLOWED_PRIMITIVES=SYMBOL_PRIMITIVES;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const num=(x,d=0)=>Number.isFinite(Number(x))?Number(x):d;
const limit=(v,min,max)=>Math.max(min,Math.min(max,v));
const pt=p=>({x:limit(num(p?.x),0,72),y:limit(num(p?.y),0,46)});
const secureText=(t,max=80)=>String(t??'').replace(/[\u0000-\u001F\u007F]/g,' ').slice(0,max);
export const ux07DefaultPrimitive=(type,index=0)=>{
 if(!SYMBOL_PRIMITIVES.includes(type))throw Error('Unsupported primitive');
 const shift=(index%6)*2;
 const defaults={
  line:{x1:12+shift,y1:12,x2:59,y2:34},
  polyline:{points:[[9,37],[36,10],[63,37]]},
  arc:{x1:9,y1:35,cx:36,cy:3,x2:63,y2:35},
  circle:{cx:36,cy:23,r:14},
  ellipse:{cx:36,cy:23,rx:23,ry:13},
  rectangle:{x:12,y:9,width:48,height:28},
  polygon:{points:[[36,6],[65,38],[7,38]]},
  text:{x:36,y:25,text:'TAG'}
 };
 return{...structuredClone(defaults[type]),type};
};
export const ux07GesturePrimitive=(type,start,end,text='TAG')=>{
 if(!SYMBOL_PRIMITIVES.includes(type))throw Error('Unsupported primitive');
 const a=pt(start),b=pt(end),x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.max(1,Math.abs(a.x-b.x)),h=Math.max(1,Math.abs(a.y-b.y));
 if(type==='line')return{type,x1:a.x,y1:a.y,x2:b.x,y2:b.y};
 if(type==='rectangle')return{type,x,y,width:w,height:h};
 if(type==='circle')return{type,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,r:Math.max(1,Math.min(w,h)/2)};
 if(type==='ellipse')return{type,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,rx:w/2,ry:h/2};
 if(type==='arc')return{type,x1:a.x,y1:b.y,cx:(a.x+b.x)/2,cy:a.y,x2:b.x,y2:b.y};
 if(type==='text')return{type,x:b.x,y:b.y,text:secureText(text)};
 if(type==='polyline')return{type,points:[[a.x,a.y],[(a.x+b.x)/2,b.y],[b.x,b.y]]};
 return{type,points:[[a.x,b.y],[(a.x+b.x)/2,a.y],[b.x,b.y]]};
};
export const ux07PrimitiveErrors=(p)=>{
 const issues=[];
 if(!SYMBOL_PRIMITIVES.includes(p?.type))return['type'];
 const geom=p.type==='line'?['x1','y1','x2','y2']:p.type==='arc'?['x1','y1','cx','cy','x2','y2']:p.type==='circle'?['cx','cy','r']:p.type==='ellipse'?['cx','cy','rx','ry']:p.type==='rectangle'?['x','y','width','height']:p.type==='text'?['x','y']:[];
 for(const k of geom)if(!finite(p[k])||Math.abs(p[k])>10000)issues.push('invalid-'+k);
 if(['circle','ellipse','rectangle'].includes(p.type))for(const k of['r','rx','ry','width','height'])if(k in p&&(!finite(p[k])||p[k]<=0))issues.push('invalid-'+k);
 if(['polyline','polygon'].includes(p.type)&&(!Array.isArray(p.points)||p.points.length<(p.type==='polygon'?3:2)||p.points.length>50||p.points.some(v=>!Array.isArray(v)||v.length!==2||v.some(n=>!finite(n)||Math.abs(n)>10000))))issues.push('points');
 if(p.type==='text'&&(typeof p.text!=='string'||p.text.length>80))issues.push('text');
 return issues;
};
export function ux07ValidateShape(s,{existing=[],requireGeometry=true}={}){
 const errors=[];
 if(!s?.custom||s?.primitive!=='custom')errors.push('not-custom');
 if(!s?.id||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,79}$/.test(s.id))errors.push('invalid-id');
 if(BUILTIN_SYMBOLS.some(x=>x.id===s?.id))errors.push('builtin-id-collision');
 if(existing.some(x=>x.id===s?.id&&x!==s))errors.push('duplicate-id');
 if(!s?.name||!String(s.name).trim()||String(s.name).length>90)errors.push('invalid-name');
 if(!LIBRARY_SCOPES.includes(s?.scope))errors.push('invalid-scope');
 if(!Array.isArray(s?.primitives)||s.primitives.length>UX07_MAX_PRIMITIVES||(requireGeometry&&s.primitives.length===0))errors.push('primitive-count');
 else for(let i=0;i<s.primitives.length;i++)for(const err of ux07PrimitiveErrors(s.primitives[i]))errors.push('primitive-'+i+'-'+err);
 if(!Array.isArray(s?.connectionPoints)||s.connectionPoints.length>UX07_MAX_PORTS)errors.push('port-count');
 else{const ids=new Set();for(const c of s.connectionPoints){if(!c.id||ids.has(c.id))errors.push('duplicate-port-id');ids.add(c.id);if(!finite(c.x)||!finite(c.y)||c.x<0||c.x>72||c.y<0||c.y>46)errors.push('port-position');if(c.role!=='reference')errors.push('unsafe-connectivity');}}
 if(!Number.isInteger(s?.version)||s.version<1)errors.push('version');
 return{valid:errors.length===0,errors};
}
export function ux07SafeCreate(input){
 const p=structuredClone(input);
 if(!Array.isArray(p.primitives))p.primitives=[];
 if(!Array.isArray(p.connectionPoints))p.connectionPoints=[];
 const s=createCustomSymbol(p);
 s.primitives=p.primitives.map(q=>({...q,text:q.type==='text'?secureText(q.text):q.text}));
 s.connectionPoints=p.connectionPoints.map(q=>({...q,role:'reference',direction:'bidirectional'}));
 const v=ux07ValidateShape(s,{requireGeometry:false});
 if(!v.valid)throw Error('Invalid custom symbol: '+v.errors.join(','));
 return s;
}
export function ux07UpdatePrimitive(s,index,patch){
 if(index<0||index>=s.primitives.length)throw Error('Index out of range');
 const p={...s.primitives[index],...structuredClone(patch)};
 if(p.type==='text')p.text=secureText(p.text);
 const errors=ux07PrimitiveErrors(p);if(errors.length)throw Error(errors.join(','));
 const primitives=s.primitives.map((q,i)=>i===index?p:q);
 return{...s,primitives};
}
export function ux07DeletePrimitive(s,index){return{...s,primitives:s.primitives.filter((_,i)=>i!==index)}}
export function ux07MovePrimitive(s,index,direction){
 const next=[...s.primitives],j=index+direction;
 if(index<0||j<0||j>=next.length)return s;
 [next[index],next[j]]=[next[j],next[index]];
 return{...s,primitives:next};
}
export function ux07TranslatePrimitive(p,dx,dy){
 const q=structuredClone(p),x=num(dx),y=num(dy);
 if(q.points)q.points=q.points.map(([px,py])=>[limit(px+x,0,72),limit(py+y,0,46)]);
 for(const k of['x','cx','x1','x2'])if(finite(q[k]))q[k]=limit(q[k]+x,0,72);
 for(const k of['y','cy','y1','y2'])if(finite(q[k]))q[k]=limit(q[k]+y,0,46);
 return q;
}
export function ux07AddReferencePoint(s,point){
 if(s.connectionPoints.length>=UX07_MAX_PORTS)throw Error('Reference point limit reached');
 const p=pt(point),used=new Set(s.connectionPoints.map(c=>c.id));let n=1;while(used.has('REF'+n))n++;
 return{...s,connectionPoints:[...s.connectionPoints,{id:'REF'+n,...p,role:'reference',direction:'bidirectional'}]};
}
export function ux07PrepareRevision(current,candidate){
 if(current&&current.id!==candidate.id)throw Error('Cannot change symbol ID in revision');
 const next={...candidate,version:current?Math.max(current.version+1,candidate.version):1};
 const v=ux07ValidateShape(next);
 if(!v.valid)throw Error(v.errors.join(','));
 return next;
}
export function ux07MergeImported(current,incoming){
 if(!Array.isArray(incoming)||incoming.length>UX07_MAX_SYMBOLS)throw Error('Too many imports');
 const map=new Map(current.map(s=>[s.id,s]));
 for(const raw of incoming){const s=ux07SafeCreate(raw),v=ux07ValidateShape(s);
  if(!v.valid)throw Error(v.errors.join(','));
  const prior=map.get(s.id);
  if(!prior||s.version>prior.version)map.set(s.id,s);
  else if(s.version===prior.version&&JSON.stringify(s.primitives)!==JSON.stringify(prior.primitives))throw Error('Version conflict '+s.id);
 }
 if(map.size>UX07_MAX_SYMBOLS)throw Error('Maximum custom library size reached');
 return[...map.values()];
}
export function ux07ParseLibrary(text){if(typeof text!=='string'||text.length>1500000)throw Error('Library too large');return ux07MergeImported([],importCustomLibrary(text))}
export const ux07SerializeLibrary=(symbols)=>exportCustomLibrary(symbols);
export function ux07RestoreSaved(raw){
 try{return ux07ParseLibrary(raw)}catch{return[]}
}
