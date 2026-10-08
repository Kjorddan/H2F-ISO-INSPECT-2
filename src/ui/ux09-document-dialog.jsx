import React,{useEffect,useMemo,useState}from'react';
import{ux09DefaultOptions,ux09BuildPlan,ux09VerifyControlled}from'../editor-core/ux09-print-plan.js';
export function Ux09DocumentDialog({documentModel,entities,inspectionStore,emissionLog=[],onClose,onExport,onPrint}){
 const [options,setOptions]=useState(()=>ux09DefaultOptions()),[gate,setGate]=useState({allowed:false,reason:'Verificando revisão formal…'}),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const plan=useMemo(()=>{try{return ux09BuildPlan({document:documentModel,entities,inspection:inspectionStore,options})}catch(e){return{error:e.message,pages:[],warnings:[],totalPageCount:0}}},[documentModel,entities,inspectionStore,options]);
 useEffect(()=>{let active=true;ux09VerifyControlled(documentModel,entities).then(r=>{if(active)setGate(r)}).catch(e=>{if(active)setGate({allowed:false,reason:e.message})});return()=>{active=false}},[documentModel,entities]);
 const change=(key,value)=>{setError('');setOptions(o=>({...o,[key]:value}))};
 const action=async(fn)=>{setBusy(true);setError('');try{await fn(options,plan,gate)}catch(e){setError(e.message||String(e))}finally{setBusy(false)}};
 return <div className="ux09Backdrop" role="presentation" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
 <section className="ux09Dialog" role="dialog" aria-modal="true" aria-labelledby="ux09-heading" data-testid="ux09-document-dialog">
 <header className="ux09Head"><div><h2 id="ux09-heading">UX-09 · PDF e emissão documental</h2><small>Exportação multipágina e impressão do documento H2F ISO INSPECT</small></div><button aria-label="Fechar emissão documental" onClick={onClose}>×</button></header>
 <div className="ux09Body"><div className="ux09Options">
 <fieldset><legend>Folhas</legend><label>Área de emissão<select aria-label="Área da impressão" value={options.scope} onChange={e=>change('scope',e.target.value)}><option value="ALL_SHEETS">Todas as folhas</option><option value="CURRENT_SHEET">Somente folha atual</option></select></label>
 <label className="ux09Check"><input type="checkbox" checked={options.includeTableContinuations} onChange={e=>change('includeTableContinuations',e.target.checked)}/>Gerar páginas de continuação para tabelas grandes</label></fieldset>
 <fieldset><legend>Tipo de documento</legend><label>Modo de geração<select aria-label="Modo de emissão" value={options.documentMode} onChange={e=>change('documentMode',e.target.value)}><option value="PREVIEW">Prévia não controlada</option><option value="CONTROLLED">Emissão controlada (requer revisão formal aprovada)</option></select></label>
 <div className={gate.allowed?'ux09Gate success':'ux09Gate'} data-testid="ux09-controlled-gate">{gate.allowed?'Snapshot formal conferido · SHA-256 correspondente':'Emissão controlada bloqueada: '+gate.reason}</div>
 <small>Mesmo no modo controlado, o arquivo não contém assinatura digital certificada. “Download solicitado” não é comprovação de entrega ou impressão.</small>
 </fieldset><fieldset><legend>Qualidade</legend><span>PDF vetorial por folha, com dimensões reais em mm (A0–A4 e personalizadas), carimbo e paginação.</span><span>Conteúdo do PDF composto separadamente, sem caixas de seleção, barras ou botões do editor.</span></fieldset>
 </div>
 <div className="ux09Pages"><h3>Plano de páginas</h3>
 <div className="ux09Stats"><span><b>{plan.sourceSheetCount||0}</b> folha(s)</span><span><b>{plan.totalPageCount||0}</b> página(s)</span><span><b>{emissionLog.length}</b> tentativa(s) controlada(s)</span></div>
 {plan.error&&<p className="ux09Error">{plan.error}</p>}
 <div className="ux09PageList" data-testid="ux09-page-list">{plan.pages.map(p=><div key={p.pageIndex} className="ux09PageRow" data-testid="ux09-plan-page"><b>{p.pageIndex}. {p.kind==='SHEET'?p.sourceSheetName:'Continuação · '+p.tableTitle}</b><span>{p.sizeMm.width} × {p.sizeMm.height} mm · {p.kind==='SHEET'?'Desenho':'Linhas '+p.fromRow+'–'+p.toRow}</span></div>)}</div>
 {plan.warnings.length>0&&<div className="ux09Warnings"><b>Atenções documentais</b>{plan.warnings.map((w,i)=><span key={i}>{w}</span>)}</div>}
 <h3>Histórico local de tentativas</h3><div className="ux09PageList">{emissionLog.slice(-5).reverse().map(x=><span key={x.id}>{x.createdAt?.slice(0,19)} · {x.fileName} · {x.state}</span>)}{!emissionLog.length&&<span>Sem emissão controlada registrada nesta sessão.</span>}</div>
 </div></div>
 <footer className="ux09Footer"><div className="ux09Error" role="status">{error||'A impressão abre o PDF no visualizador para usar o comando de impressão do navegador.'}</div><button onClick={onClose}>Fechar</button><button disabled={busy||!!plan.error||!plan.pages.length||(options.documentMode==='CONTROLLED'&&!gate.allowed)} onClick={()=>action(onPrint)}>{busy?'Gerando…':'Abrir para imprimir'}</button><button className="ux09Primary" disabled={busy||!!plan.error||!plan.pages.length||(options.documentMode==='CONTROLLED'&&!gate.allowed)} onClick={()=>action(onExport)}>{busy?'Gerando…':'Gerar PDF único'}</button></footer>
 </section></div>;
}
