import React from'react';
import{Ux08SheetOverlay}from'./ux08-sheet-designer.jsx';
import{ux08FrameGeometry}from'../editor-core/ux08-sheet-layout.js';
import{ux09ScopedEntities}from'../editor-core/ux09-print-plan.js';
const SVG_STYLES=".entity rect{fill:#f8fafc;stroke:#64748b;stroke-width:1.7}.entity text{font-family:Arial,sans-serif;fill:#1f2937;font-size:13px}.entity .entityId{font-size:10px;fill:#4b5563}.annotationText .annotationHitBox,.industrialSymbol .symbolHitBox{fill:transparent;stroke:none}.entity.polylineEntity .pipeCenterline{fill:none;stroke:#20394d;stroke-width:2.1;stroke-linecap:round}.entity.polylineEntity .pipeSecondary{fill:none;stroke:#94a3b8;stroke-width:5}.entity.pipeStyle-future .pipeCenterline{stroke-dasharray:8 5}.entity.pipeStyle-removed .pipeCenterline{stroke-dasharray:3 4}.entity.pipeStyle-buried .pipeCenterline{stroke-dasharray:12 4 2 4}.industrialSymbol .symbolGlyph,.industrialSymbol .symbolGlyph *{stroke:#263a4b;stroke-width:1.5;fill:none}.industrialSymbol .symbolGlyph text{stroke:none;fill:#263a4b;font-size:10px}.industrialSymbol .symbolEntityLabel{font-size:11px;fill:#28394b}.documentationGlyph path,.documentationGlyph line,.annotationLeader path,.annotationLeader polyline{stroke:#263a4b;stroke-width:1.25;fill:none}.ux08SheetOverlay text,.ux08Table text,.ux08TitleBlock text{font-family:Arial,Helvetica,sans-serif;fill:#263d56;stroke:none}.ux09Footer{font-family:Arial,Helvetica,sans-serif;fill:#334155;stroke:none}";
export function Ux09ExportCanvas({page,document,entities=[],inspectionStore={},renderEntity}){
 const sheet=document.sheets.find(s=>s.id===page.sheetId);
 if(!sheet)throw Error('Folha ausente na renderização: '+page.sheetId);
 const sceneEntities=ux09ScopedEntities(entities,sheet);
 const kind=page.kind==='TABLE_CONTINUATION';
 const status=page.documentMode==='CONTROLLED'?'EMISSÃO CONTROLADA · NÃO ASSINADA':'PRÉVIA NÃO CONTROLADA';
 const paper=ux08FrameGeometry(sheet).paper,footerY=paper.y+paper.height-5,footerHeight=17;
 const footerText=[status,document.revisionState||'RASCUNHO','REV '+page.revision,'SEM ASSINATURA'].join(' · ');
 return <svg xmlns="http://www.w3.org/2000/svg" width={paper.width} height={paper.height} viewBox={[paper.x,paper.y,paper.width,paper.height].join(' ')} data-ux09-page={page.pageIndex} data-ux09-sheet={page.sheetId} data-ux09-kind={page.kind}>
 <style>{SVG_STYLES}</style><rect width="1120" height="720" fill="#fff"/>
 {!kind&&<g data-ux09-scene="true">{sceneEntities.map(entity=>React.createElement(renderEntity,{key:entity.id,e:entity,selected:false,onDown:()=>{},allEntities:entities}))}</g>}
 {!kind&&<Ux08SheetOverlay sheet={sheet} documentModel={document} entities={sceneEntities} inspectionStore={inspectionStore}/>}
 {kind&&<g data-ux09-continuation="true">
 <rect x={paper.x+15} y={paper.y+15} width={paper.width-30} height={paper.height-30} fill="none" stroke="#344c63" strokeWidth="1.5"/>
 <rect x={paper.x+15} y={paper.y+15} width={paper.width-30} height="66" fill="#e8f0f7"/>
 <text x={paper.x+25} y={paper.y+40} fontSize="15" fontWeight="700" fill="#1f3447">H2F ISO INSPECT · CONTINUAÇÃO</text>
 <text x={paper.x+25} y={paper.y+63} fontSize="11" fill="#334155">{page.sourceSheetName} · {page.tableTitle} · rev. {page.revision}</text>
 <rect x={paper.x+25} y={paper.y+101} width={paper.width-50} height="32" fill="#e2e8f0" stroke="#344c63" strokeWidth=".8"/>
 {page.headers.map((col,k)=><text key={k} x={paper.x+30+k*(paper.width-55)/page.headers.length} y={paper.y+123} fontSize="10" fontWeight="700" fill="#1f3447">{String(col).slice(0,25)}</text>)}
 {page.rows.map((row,i)=><g key={i}><line x1={paper.x+25} x2={paper.x+paper.width-25} y1={paper.y+165+i*Math.max(19,Math.min(31,(paper.height-180)/Math.max(page.rows.length,1)))} y2={paper.y+165+i*Math.max(19,Math.min(31,(paper.height-180)/Math.max(page.rows.length,1)))} stroke="#cbd5e1" strokeWidth=".6"/>
 {row.slice(0,page.headers.length).map((cell,k)=><text key={k} x={paper.x+30+k*(paper.width-55)/page.headers.length} y={paper.y+152+i*Math.max(19,Math.min(31,(paper.height-180)/Math.max(page.rows.length,1)))} fill="#1f3447" fontSize="10">{String(cell??'').slice(0,Math.max(10,Math.floor(paper.width/page.headers.length/6)))}</text>)}</g>)}
 <text x={paper.x+25} y={paper.y+paper.height-28} fontSize="10" fill="#64748b">Linhas {page.fromRow}–{page.toRow} de {page.totalRows} · dados existentes</text>
 </g>}
 <rect x={paper.x+1} y={footerY-footerHeight+2} width={paper.width-2} height={footerHeight} fill="#fff" fillOpacity=".98"/>
 <text className="ux09Footer" x={paper.x+5} y={footerY} fontSize={Math.max(6,Math.min(9,paper.width/78))}>{footerText}</text>
 <text className="ux09Footer" x={paper.x+paper.width-5} y={footerY} textAnchor="end" fontSize={Math.max(7,Math.min(9,paper.width/85))}>Página {page.pageIndex} / {page.pageCount}</text>
 </svg>;
}
