import React,{useRef,useState}from'react';
import{SymbolGlyph}from'./industrial-symbol-glyphs.jsx';
import{LIBRARY_CATEGORIES,LIBRARY_SCOPES,SYMBOL_PRIMITIVES}from'../editor-core/library.js';
import{UX07_BOUNDS,UX07_MAX_PRIMITIVES,ux07DefaultPrimitive,ux07GesturePrimitive,ux07PrimitiveErrors,ux07ValidateShape,ux07UpdatePrimitive,ux07DeletePrimitive,ux07MovePrimitive,ux07TranslatePrimitive,ux07AddReferencePoint}from'../editor-core/ux07-custom-shapes.js';
const FIELDS={line:['x1','y1','x2','y2'],arc:['x1','y1','cx','cy','x2','y2'],circle:['cx','cy','r'],ellipse:['cx','cy','rx','ry'],rectangle:['x','y','width','height'],text:['x','y'],polyline:[],polygon:[]};
const NAME={line:'Linha',polyline:'Polilinha',arc:'Arco Bézier',circle:'Círculo',ellipse:'Elipse',rectangle:'Retângulo',polygon:'Polígono',text:'Texto'};
const pos=(evt,svg)=>{const matrix=svg.getScreenCTM();if(!matrix)return{x:36,y:23};const p=svg.createSVGPoint();p.x=evt.clientX;p.y=evt.clientY;const w=p.matrixTransform(matrix.inverse());const clampRound=(value,max)=>Math.round(Math.max(0,Math.min(max,value))*10)/10;return{x:clampRound(w.x,72),y:clampRound(w.y,46)}};
export function Ux07ShapeEditor({symbol,onChange,onSave,onClose,existing=[]}){
 const svgRef=useRef(null),dragRef=useRef(null),undoRef=useRef([]),redoRef=useRef([]);
 const[selected,setSelected]=useState(-1),[tool,setTool]=useState('select'),[preview,setPreview]=useState(null),[alert,setAlert]=useState('');
 const valid=ux07ValidateShape(symbol),editing=existing.some(s=>s.id===symbol.id),selectedPrimitive=symbol.primitives[selected]||null;
 const apply=next=>{undoRef.current.push(structuredClone(symbol));if(undoRef.current.length>60)undoRef.current.shift();redoRef.current=[];onChange(next);setAlert('')};
 const patch=part=>apply({...symbol,...part});
 const primitive=(index,patch)=>{try{apply(ux07UpdatePrimitive(symbol,index,patch))}catch(e){setAlert(e.message)}};
 const add=(type)=>{if(symbol.primitives.length>=UX07_MAX_PRIMITIVES){setAlert('Limite de primitivas atingido');return}apply({...symbol,primitives:[...symbol.primitives,ux07DefaultPrimitive(type,symbol.primitives.length)]});setSelected(symbol.primitives.length);setTool('select')};
 const onDown=e=>{if(e.button!==0)return;const start=pos(e,svgRef.current);dragRef.current={start,current:start,primitiveIndex:tool==='select'?-1:null};svgRef.current.setPointerCapture(e.pointerId);setPreview(start)};
 const onMove=e=>{if(!dragRef.current)return;const point=pos(e,svgRef.current);dragRef.current.current=point;setPreview(point)};
 const onUp=e=>{if(!dragRef.current)return;const {start,primitiveIndex}=dragRef.current,end=pos(e,svgRef.current);dragRef.current=null;setPreview(null);
  if(tool==='reference'){try{apply(ux07AddReferencePoint(symbol,end))}catch(err){setAlert(err.message)}return}
  if(tool==='select'&&primitiveIndex!=null&&primitiveIndex>=0){if(Math.abs(end.x-start.x)+Math.abs(end.y-start.y)>.15)primitive(primitiveIndex,ux07TranslatePrimitive(symbol.primitives[primitiveIndex],end.x-start.x,end.y-start.y));return}
  if(tool==='select')return;
  if(symbol.primitives.length>=UX07_MAX_PRIMITIVES){setAlert('Limite de primitivas atingido');return}
  const p=ux07GesturePrimitive(tool,start,end,symbol.acronym||'TAG');if(ux07PrimitiveErrors(p).length){setAlert('Geometria inválida');return}
  apply({...symbol,primitives:[...symbol.primitives,p]});setSelected(symbol.primitives.length);setTool('select');
 };
 const onPartDown=(e,i)=>{if(tool!=='select')return;e.stopPropagation();onDown(e);if(dragRef.current)dragRef.current.primitiveIndex=i;setSelected(i)};
 const undo=()=>{const previous=undoRef.current.pop();if(previous){redoRef.current.push(structuredClone(symbol));onChange(previous);setSelected(-1)}};
 const redo=()=>{const next=redoRef.current.pop();if(next){undoRef.current.push(structuredClone(symbol));onChange(next);setSelected(-1)}};
 const setPoints=v=>{try{const points=v.trim().split(/\s*;\s*/).map(pair=>pair.split(/\s*,\s*/).map(Number));primitive(selected,{points})}catch(e){setAlert('Pontos inválidos: use x,y; x,y; x,y')}};
 return <div className="ux07Backdrop" role="presentation" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
 <section className="ux07Editor" role="dialog" aria-modal="true" aria-labelledby="ux07-heading" data-testid="ux07-shape-editor">
  <header className="ux07Head"><div><h2 id="ux07-heading">UX-07 · Criador de Formas Personalizadas</h2><small>{editing?'Nova revisão de definição existente':'Nova definição gráfica H2F'} · rascunho local</small></div><button title="Fechar editor" aria-label="Fechar editor" onClick={onClose}>×</button></header>
  <div className="ux07Body">
   <aside className="ux07Settings"><h3>Identificação</h3>
    <label>Nome da forma<input aria-label="Nome da forma" maxLength={90} value={symbol.name} onChange={e=>patch({name:e.target.value})}/></label>
    <label>ID imutável<input aria-label="ID da forma" value={symbol.id} disabled/></label>
    <label>Sigla<input aria-label="Sigla da forma" maxLength={16} value={symbol.acronym} onChange={e=>patch({acronym:e.target.value})}/></label>
    <label>Categoria<select aria-label="Categoria da forma" value={symbol.category} onChange={e=>patch({category:e.target.value})}>{LIBRARY_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Escopo do catálogo<select aria-label="Escopo do catálogo" value={symbol.scope} onChange={e=>patch({scope:e.target.value})}>{LIBRARY_SCOPES.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Descrição<textarea aria-label="Descrição da forma" maxLength={280} value={symbol.description} onChange={e=>patch({description:e.target.value})}/></label>
    <div className="ux07Info">Símbolo de projeto. Uso e ligação física dependem de validação de engenharia. Versão atual: {symbol.version}.</div>
   </aside>
   <section className="ux07Workspace">
    <div className="ux07Tools"><button className={tool==='select'?'active':''} onClick={()=>setTool('select')} title="Selecionar e mover elementos">Selecionar</button>{SYMBOL_PRIMITIVES.map(type=><button key={type} title={'Desenhar '+NAME[type]} className={tool===type?'active':''} onClick={()=>setTool(type)}>{NAME[type]}</button>)}<button className={tool==='reference'?'active':''} onClick={()=>setTool('reference')}>＋ Referência</button></div>
    <div className="ux07Stage"><svg ref={svgRef} data-testid="ux07-drawing-surface" viewBox="0 0 72 46" preserveAspectRatio="xMidYMid meet" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={()=>{dragRef.current=null;setPreview(null)}}>
     <rect width="72" height="46" fill="#fff" stroke="#94a3b8" strokeWidth=".25"/>
     {Array.from({length:13},(_,i)=><line key={'v'+i} x1={i*6} y1="0" x2={i*6} y2="46" stroke="#e2e8f0" strokeWidth=".12" pointerEvents="none"/>)}
     {Array.from({length:9},(_,i)=><line key={'h'+i} x1="0" y1={i*6} x2="72" y2={i*6} stroke="#e2e8f0" strokeWidth=".12" pointerEvents="none"/>)}
     <line x1="36" y1="0" x2="36" y2="46" stroke="#94a3b8" strokeDasharray=".4 .8" strokeWidth=".2" pointerEvents="none"/>
     <line x1="0" y1="23" x2="72" y2="23" stroke="#94a3b8" strokeDasharray=".4 .8" strokeWidth=".2" pointerEvents="none"/>
     {symbol.primitives.map((p,i)=><g key={i} className={'ux07Primitive '+(selected===i?'chosen':'')} data-primitive-index={i} onPointerDown={e=>onPartDown(e,i)}>
      <SymbolGlyph symbol={{...symbol,primitives:[p]}} x={0} y={0} width={72} height={46}/>
     </g>)}
     {symbol.connectionPoints.map((p,i)=><g key={p.id} className="ux07Port" pointerEvents="none"><circle cx={p.x} cy={p.y} r="1.15"/><text x={Math.min(70,p.x+1.6)} y={Math.max(2,p.y-1.5)} fontSize="1.8">{p.id}</text></g>)}
     {dragRef.current&&preview&&tool!=='select'&&tool!=='reference'&&<SymbolGlyph symbol={{...symbol,primitives:[ux07GesturePrimitive(tool,dragRef.current.start,preview)]}} x={0} y={0} width={72} height={46}/>}
    </svg></div>
    <div className="ux07ToolbarBottom"><span>Canvas 72 × 46 unidades gráficas · {symbol.primitives.length} elementos · {symbol.connectionPoints.length} referências</span><div><button onClick={undo} disabled={!undoRef.current.length}>↶ Desfazer</button><button onClick={redo} disabled={!redoRef.current.length}>↷ Refazer</button><button onClick={()=>setSelected(-1)}>Limpar seleção</button></div></div>
   </section>
   <aside className="ux07Props"><h3>Elementos</h3><div className="ux07PrimitiveList">{symbol.primitives.map((p,i)=><button key={i} className={selected===i?'active':''} onClick={()=>{setSelected(i);setTool('select')}}><span>{i+1}. {NAME[p.type]}</span></button>)}</div>
    {selectedPrimitive?<div className="ux07ElementFields"><b>Editar {NAME[selectedPrimitive.type]}</b>{(FIELDS[selectedPrimitive.type]||[]).map(field=><label key={field}>{field}<input aria-label={'Coordenada '+field} type="number" step=".5" value={selectedPrimitive[field]??0} onChange={e=>primitive(selected,{[field]:Number(e.target.value)})}/></label>)}
    {selectedPrimitive.type==='text'&&<label>Texto<input aria-label="Texto da primitiva" maxLength={80} value={selectedPrimitive.text||''} onChange={e=>primitive(selected,{text:e.target.value})}/></label>}
    {['polyline','polygon'].includes(selectedPrimitive.type)&&<label>Vértices (x,y; x,y)<textarea aria-label="Vértices da primitiva" defaultValue={(selectedPrimitive.points||[]).map(p=>p.join(',')).join('; ')} key={selected} onBlur={e=>setPoints(e.target.value)}/></label>}
    <div className="ux07Reorder"><button onClick={()=>{apply(ux07MovePrimitive(symbol,selected,-1));setSelected(Math.max(0,selected-1))}}>↑</button><button onClick={()=>{apply(ux07MovePrimitive(symbol,selected,1));setSelected(Math.min(symbol.primitives.length-1,selected+1))}}>↓</button><button onClick={()=>{apply(ux07DeletePrimitive(symbol,selected));setSelected(-1)}}>Excluir</button></div></div>:<p className="ux07Info">Selecione um elemento para editar sua geometria; desenhe diretamente com uma ferramenta ativa.</p>}
    <h3>Pontos de referência</h3><p className="ux07Info">Referências gráficas, sem ligação automática a processo.</p><div className="ux07PrimitiveList">{symbol.connectionPoints.map((p,i)=><div className="ux07Reference" key={p.id}><span>{p.id} ({p.x.toFixed(1)}; {p.y.toFixed(1)})</span><button aria-label={'Excluir referência '+p.id} onClick={()=>patch({connectionPoints:symbol.connectionPoints.filter((_,j)=>i!==j)})}>×</button></div>)}</div>
   </aside>
  </div>
  <footer className="ux07Footer"><div className="ux07Validation">{alert||(!valid.valid?'Corrigir: '+valid.errors.join(', '):'Definição validada · sem conexões de processo automáticas')}</div><button onClick={onClose}>Cancelar</button><button className="ux07Save" disabled={!valid.valid} onClick={()=>{try{onSave(symbol);setAlert('')}catch(e){setAlert(e.message)}}}>Salvar {editing?'nova revisão':'nova forma'}</button></footer>
 </section></div>;
}
