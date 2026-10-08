import React,{useState}from'react';
import{SHEET_FORMATS}from'../editor-core/document-structure.js';
import{UX08_PAPER,UX08_TABLE_KINDS,UX08_ANCHORS,UX08_PRESETS,ux08Layout,ux08ValidateSheet,ux08FrameGeometry,ux08TableData}from'../editor-core/ux08-sheet-layout.js';
const N={MATERIAL:'Materiais',WELD:'Soldas',END:'Ensaios END',TML:'TML/CML',REVISION:'Revisões',NOTES:'Notas',MANUAL:'Tabela manual'};
const F=[['company','Empresa'],['client','Cliente'],['project','Projeto'],['area','Área / unidade'],['unit','Unidade'],['lineNumber','Linha'],['title','Título'],['drawing','Desenho'],['document','Documento'],['revision','Revisão'],['preparedBy','Elaborado por'],['checkedBy','Verificado por'],['approvedBy','Aprovado por'],['dates','Data'],['scale','Escala'],['notes','Notas']];
const value=x=>String(x??'');
function ShortText({x,y,children,size=10,weight='normal',max=75,anchor='start'}){const text=value(children);return <text x={x} y={y} fontSize={size} fontWeight={weight} textAnchor={anchor}>{text.length>max?text.slice(0,max-1)+'…':text}</text>}
export function Ux08SheetOverlay({sheet,documentModel,entities=[],inspectionStore={},preview=false}){
 if(!sheet)return null;
 const layout=ux08Layout(sheet),geo=ux08FrameGeometry(sheet),{paper,frame,titleBlock,scale,sizeMm}=geo;
 const fill=layout.style==='FIELD'?'#eef5f8':layout.style==='MINIMAL'?'#f8fafc':'#e8f0f7';
 const line=layout.style==='FIELD'?'#176386':'#344c63';
 const cell=layout.style==='MINIMAL'?'#e5e7eb':'#c9d7e5';
 const fs=Math.max(9,Math.min(12,3.1*scale)),margin=6;
 const zones=layout.frame.zones?Array.from({length:layout.frame.zoneCount-1},(_,i)=>i+1):[];
 const visibleTables=layout.tables.filter(t=>t.visible!==false);
 const bucket={};
 const placements=visibleTables.map(t=>{
  const model=ux08TableData(t,{sheet,entities,inspection:inspectionStore,document:documentModel});
  const w=Math.min(t.widthMm*scale,frame.width),rowH=fs+7,h=(model.rows.length+2)*rowH+2;
  const last=bucket[t.anchor]||0;bucket[t.anchor]=last+h+5;
  const x=t.anchor.endsWith('RIGHT')?frame.x+frame.width-w:frame.x;
  let y=t.anchor.startsWith('BOTTOM')?frame.y+frame.height-h-last:frame.y+last;
  if(t.anchor==='BOTTOM_RIGHT')y-=layout.titleBlock.visible?titleBlock.height+6:0;
  return{t,model,x,y,w,h,rowH};
 });
 const titleRows=[
  [['EMPRESA',sheet.titleBlock?.company||'H2F Inspeção e Inovação'],['CLIENTE',sheet.titleBlock?.client]],
  [['PROJETO',sheet.titleBlock?.project],['ÁREA',sheet.titleBlock?.area]],
  [['DOCUMENTO',sheet.titleBlock?.document],['DESENHO',sheet.titleBlock?.drawing]],
  [['TÍTULO',sheet.titleBlock?.title||sheet.name],['LINHA',sheet.titleBlock?.lineNumber]],
  [['REV.',sheet.titleBlock?.revision||'0'],['ESCALA',sheet.titleBlock?.scale||'NTS'],['FOLHA',sheet.name]],
  [['ELAB.',sheet.titleBlock?.preparedBy||'—'],['VERIF.',sheet.titleBlock?.checkedBy||'—'],['APROV.',sheet.titleBlock?.approvedBy||'—']]
 ];
 const titleH=titleBlock.height/titleRows.length;
 return <g className={'ux08SheetOverlay '+(preview?'preview':'')} pointerEvents="none" data-testid={preview?'ux08-layout-preview':'ux08-sheet-overlay'} data-ux08-format={sheet.format} data-ux08-orientation={sheet.orientation}>
 <rect className="ux08PageBoundary" x={paper.x} y={paper.y} width={paper.width} height={paper.height} fill="none" stroke="#9aaabd" strokeWidth=".7"/>
 {layout.frame.visible&&<><rect className="ux08PageFrame" x={frame.x} y={frame.y} width={frame.width} height={frame.height} fill="none" stroke={line} strokeWidth="1.6"/>
 {zones.map(i=><g key={i}><line x1={frame.x+frame.width*i/layout.frame.zoneCount} x2={frame.x+frame.width*i/layout.frame.zoneCount} y1={paper.y+1} y2={frame.y} stroke={line} strokeWidth=".8"/><line x1={frame.x+frame.width*i/layout.frame.zoneCount} x2={frame.x+frame.width*i/layout.frame.zoneCount} y1={frame.y+frame.height} y2={paper.y+paper.height-1} stroke={line} strokeWidth=".8"/><line y1={frame.y+frame.height*i/layout.frame.zoneCount} y2={frame.y+frame.height*i/layout.frame.zoneCount} x1={paper.x+1} x2={frame.x} stroke={line} strokeWidth=".8"/><line y1={frame.y+frame.height*i/layout.frame.zoneCount} y2={frame.y+frame.height*i/layout.frame.zoneCount} x1={frame.x+frame.width} x2={paper.x+paper.width-1} stroke={line} strokeWidth=".8"/></g>)}
 {layout.frame.zones&&<><ShortText x={frame.x+frame.width/2} y={frame.y-3} size={fs-2} anchor="middle">{sheet.name.toUpperCase()} · {sheet.format} · {sizeMm.width} × {sizeMm.height} mm</ShortText><ShortText x={frame.x+3} y={frame.y+frame.height+fs-1} size={fs-2}>H2F ISO INSPECT · NTS salvo indicação</ShortText></>}
 </>}
 {placements.map(({t,model,x,y,w,h,rowH})=><g className="ux08Table" data-ux08-table={t.kind} key={t.id} transform={'translate('+x+' '+y+')'}>
 <rect width={w} height={h} fill="#fff" fillOpacity=".94" stroke={line} strokeWidth=".9"/>
 <rect width={w} height={rowH} fill={fill}/>
 <ShortText x={margin} y={rowH-6} size={fs} weight="700" max={50}>{t.title||N[t.kind]}</ShortText>
 <line x1="0" y1={rowH} x2={w} y2={rowH} stroke={line} strokeWidth=".7"/>
 {model.headers.map((head,k)=><ShortText key={k} x={margin+(w-margin*2)*k/model.headers.length} y={rowH*2-5} size={fs-1} weight="700" max={24}>{head}</ShortText>)}
 {model.rows.map((row,i)=><g key={i}><line x1="0" y1={(i+2)*rowH} x2={w} y2={(i+2)*rowH} stroke={cell} strokeWidth=".45"/>
 {row.slice(0,model.headers.length).map((c,k)=><ShortText key={k} x={margin+(w-margin*2)*k/model.headers.length} y={(i+3)*rowH-6} size={fs-1} max={Math.max(5,Math.floor(w/(model.headers.length*(fs-1)*.56))-1)}>{c}</ShortText>)}</g>)}
 {model.total>model.rows.length&&<ShortText x={w-margin} y={h-3} anchor="end" size={fs-2}>+{model.total-model.rows.length} registros não exibidos</ShortText>}
 </g>)}
 {layout.titleBlock.visible&&<g className="ux08TitleBlock" data-testid="ux08-title-block" transform={'translate('+titleBlock.x+' '+titleBlock.y+')'}>
 <rect width={titleBlock.width} height={titleBlock.height} fill="#fff" fillOpacity=".97" stroke={line} strokeWidth="1.4"/>
 <rect width={titleBlock.width} height={titleH} fill={fill}/>
 {titleRows.map((cols,row)=><g key={row}>{row>0&&<line x1="0" y1={row*titleH} x2={titleBlock.width} y2={row*titleH} stroke={line} strokeWidth=".55"/>}
 {cols.map(([label,data],i)=><g key={label}><line x1={titleBlock.width*i/cols.length} y1={row*titleH} x2={titleBlock.width*i/cols.length} y2={(row+1)*titleH} stroke={cell} strokeWidth=".6"/>
 <ShortText x={titleBlock.width*i/cols.length+margin} y={row*titleH+Math.min(10,titleH*.4)} size={fs-2} weight="700" max={20}>{label}</ShortText>
 <ShortText x={titleBlock.width*i/cols.length+margin} y={row*titleH+Math.max(16,titleH*.77)} size={fs} max={Math.floor(titleBlock.width/cols.length/(fs*.53))-2}>{data||'—'}</ShortText></g>)}</g>)}
 </g>}
 <title>Pré-visualização de formatação da folha; exportação/impressão documental final na UX-09</title>
 </g>;
}
export function Ux08SheetDesigner({sheet,documentModel,entities,inspectionStore,onClose,onSetPage,onLayout,onTitle,onPreset,onAddTable,onEditTable,onDeleteTable,onSaveTemplate,templates=[]}){
 const [error,setError]=useState(''),[templateName,setTemplateName]=useState('');
 const layout=ux08Layout(sheet),v=ux08ValidateSheet(sheet);
 const attempt=fn=>{try{fn();setError('')}catch(e){setError(e.message)}};
 const update=patch=>attempt(()=>onLayout(patch));
 const setMargin=(key,value)=>update({frame:{marginsMm:{[key]:Number(value)}}});
 return <div className="ux08Backdrop" role="presentation" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
 <section role="dialog" aria-modal="true" aria-labelledby="ux08-dialog-heading" data-testid="ux08-sheet-designer" className="ux08Dialog">
 <header className="ux08Head"><div><h2 id="ux08-dialog-heading">UX-08 · Formatação de folha</h2><small>{sheet.name} · carimbo e tabelas gráficas H2F, sem modificar geometria de tubulação</small></div><button aria-label="Fechar formatação" onClick={onClose}>×</button></header>
 <div className="ux08Body">
 <div className="ux08Controls">
 <fieldset><legend>Formato e orientação</legend>
 <label>Formato<select aria-label="Formato da folha" value={sheet.format} onChange={e=>attempt(()=>onSetPage({format:e.target.value,customSize:e.target.value==='CUSTOM'?[297,420]:null}))}>{[...Object.keys(SHEET_FORMATS),'CUSTOM'].map(s=><option key={s} value={s}>{s==='CUSTOM'?'Personalizado':s}</option>)}</select></label>
 <label>Orientação<select aria-label="Orientação da folha" value={sheet.orientation} onChange={e=>attempt(()=>onSetPage({orientation:e.target.value}))}><option value="landscape">Paisagem</option><option value="portrait">Retrato</option></select></label>
 {sheet.format==='CUSTOM'&&<div className="ux08Pair">{['Largura','Altura'].map((label,i)=><label key={label}>{label} base (mm)<input type="number" min="100" max="2000" aria-label={label+' personalizado'} value={sheet.customSize?.[i]||0} onChange={e=>{const arr=[...(sheet.customSize||[297,420])];arr[i]=Number(e.target.value);attempt(()=>onSetPage({customSize:arr}))}}/></label>)}</div>}
 </fieldset>
 <fieldset><legend>Moldura e zonas</legend>
 <label className="ux08Check"><input type="checkbox" checked={layout.frame.visible} onChange={e=>update({frame:{visible:e.target.checked}})}/>Exibir moldura</label>
 <label className="ux08Check"><input type="checkbox" checked={layout.frame.zones} onChange={e=>update({frame:{zones:e.target.checked}})}/>Exibir marcas de zonas</label>
 <label>Zonas por lado<input type="number" aria-label="Quantidade de zonas" min="2" max="12" value={layout.frame.zoneCount} onChange={e=>update({frame:{zoneCount:Number(e.target.value)}})}/></label>
 <div className="ux08Pair">{Object.keys(layout.frame.marginsMm).map(k=><label key={k}>Margem {({left:'esquerda',right:'direita',top:'superior',bottom:'inferior'})[k]} (mm)<input type="number" aria-label={'Margem '+k} min="0" max="40" value={layout.frame.marginsMm[k]} onChange={e=>setMargin(k,e.target.value)}/></label>)}</div>
 </fieldset>
 <fieldset><legend>Carimbo técnico</legend>
 <label className="ux08Check"><input type="checkbox" checked={layout.titleBlock.visible} onChange={e=>update({titleBlock:{visible:e.target.checked}})}/>Mostrar carimbo</label>
 <div className="ux08Pair">{[['widthMm','Largura'],['heightMm','Altura']].map(([key,label])=><label key={key}>{label} (mm)<input type="number" min={key==='widthMm'?30:20} max={key==='widthMm'?500:220} aria-label={label+' do carimbo'} value={layout.titleBlock[key]} onChange={e=>update({titleBlock:{[key]:Number(e.target.value)}})}/></label>)}</div>
 <div className="ux08Fields">{F.map(([key,label])=><label key={key}>{label}<input aria-label={'Carimbo '+label} maxLength={280} value={sheet.titleBlock?.[key]||''} onChange={e=>onTitle({[key]:e.target.value})}/></label>)}</div>
 </fieldset>
 <fieldset><legend>Templates</legend>
 <label>Modelo de base<select aria-label="Template da folha" value={layout.templateId} onChange={e=>attempt(()=>onPreset(e.target.value))}>
 {[...UX08_PRESETS,...templates].map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
 {!UX08_PRESETS.some(t=>t.id===layout.templateId)&&!templates.some(t=>t.id===layout.templateId)&&<option value={layout.templateId}>{layout.templateId}</option>}
 </select></label>
 <label>Salvar template local<input aria-label="Nome do novo template" placeholder="Ex.: Carimbo Cliente X" maxLength="80" value={templateName} onChange={e=>setTemplateName(e.target.value)}/></label>
 <button onClick={()=>attempt(()=>{onSaveTemplate(templateName);setTemplateName('')})} disabled={!templateName.trim()}>Salvar modelo</button>
 <small>Modelos locais não são publicados em servidores nem aprovados automaticamente.</small>
 </fieldset>
 </div>
 <div className="ux08Center"><div className="ux08PreviewTop"><b>Visualização editorial</b><span>{sheet.format} · {sheet.orientation==='landscape'?'paisagem':'retrato'}</span></div>
 <svg data-testid="ux08-preview-svg" viewBox="0 0 1120 720" preserveAspectRatio="xMidYMid meet"><rect width="1120" height="720" fill="#fff"/><Ux08SheetOverlay sheet={sheet} documentModel={documentModel} entities={entities} inspectionStore={inspectionStore} preview/></svg>
 <p>A escala da visualização é gráfica. A formatação não altera os comprimentos físicos nem o isométrico. Impressão e PDF final serão tratados na UX-09.</p>
 </div>
 <div className="ux08Tables"><h3>Tabelas da folha</h3><label>Adicionar tabela<select aria-label="Tipo de tabela para adicionar" id="ux08TableType" defaultValue="MATERIAL">{UX08_TABLE_KINDS.map(k=><option key={k} value={k}>{N[k]}</option>)}</select></label>
 <button onClick={()=>attempt(()=>onAddTable(document.getElementById('ux08TableType').value))}>＋ Adicionar tabela</button>
 <div className="ux08TableList">{layout.tables.map(t=><div className="ux08TableEditor" key={t.id} data-testid={'ux08-table-'+t.id}><b>{N[t.kind]}</b>
 <label>Título<input aria-label={'Título da tabela '+t.id} value={t.title} maxLength="80" onChange={e=>attempt(()=>onEditTable(t.id,{title:e.target.value}))}/></label>
 <label>Posição<select aria-label={'Posição da tabela '+t.id} value={t.anchor} onChange={e=>attempt(()=>onEditTable(t.id,{anchor:e.target.value}))}>{UX08_ANCHORS.map(a=><option key={a} value={a}>{({TOP_LEFT:'Superior esquerda',TOP_RIGHT:'Superior direita',BOTTOM_LEFT:'Inferior esquerda',BOTTOM_RIGHT:'Inferior direita'})[a]}</option>)}</select></label>
 <div className="ux08Pair"><label>Largura (mm)<input type="number" aria-label={'Largura da tabela '+t.id} min="25" max="500" value={t.widthMm} onChange={e=>attempt(()=>onEditTable(t.id,{widthMm:Number(e.target.value)}))}/></label><label>Linhas<input type="number" aria-label={'Linhas da tabela '+t.id} min="1" max="15" value={t.maxRows} onChange={e=>attempt(()=>onEditTable(t.id,{maxRows:Number(e.target.value)}))}/></label></div>
 {t.kind==='MANUAL'&&<label>Linhas manuais (descrição; valor por linha)<textarea aria-label={'Linhas manuais '+t.id} value={t.manualRows.map(row=>row.join('; ')).join('\n')} onChange={e=>attempt(()=>onEditTable(t.id,{manualRows:e.target.value.split('\n').filter(Boolean).map(line=>line.split(';').map(v=>v.trim()).slice(0,5))}))}/></label>}
 <div className="ux08TableActions"><label className="ux08Check"><input type="checkbox" checked={t.visible!==false} onChange={e=>attempt(()=>onEditTable(t.id,{visible:e.target.checked}))}/>Visível</label><button onClick={()=>attempt(()=>onDeleteTable(t.id))}>Excluir</button></div>
 </div>)}</div>
 </div>
 </div>
 <footer className="ux08Foot"><span>{error||(!v.valid?'Erro: '+v.errors.join(', '):'Folha válida · alterações persistidas no documento')}</span><button onClick={onClose}>Concluir</button></footer>
 </section></div>;
}
