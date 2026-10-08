import React from'react';

const CustomGlyph=({symbol,x,y,width,height})=><g className="symbolGlyph customGlyph">{(symbol.primitives||[]).map((q,i)=>{
 const sx=width/72,sy=height/46,px=n=>x+n*sx,py=n=>y+n*sy;
 if(q.type==='line')return <line key={i} x1={px(q.x1??8)} y1={py(q.y1??23)} x2={px(q.x2??64)} y2={py(q.y2??23)}/>;
 if(q.type==='circle')return <circle key={i} cx={px(q.cx??36)} cy={py(q.cy??23)} r={(q.r??12)*Math.min(sx,sy)}/>;
 if(q.type==='ellipse')return <ellipse key={i} cx={px(q.cx??36)} cy={py(q.cy??23)} rx={(q.rx??20)*sx} ry={(q.ry??12)*sy}/>;
 if(q.type==='rectangle')return <rect key={i} x={px(q.x??12)} y={py(q.y??10)} width={(q.width??48)*sx} height={(q.height??26)*sy}/>;
 if(q.type==='polyline'||q.type==='polygon')return React.createElement(q.type==='polygon'?'polygon':'polyline',{key:i,points:(q.points||[[8,34],[36,10],[64,34]]).map(a=>`${px(a[0])},${py(a[1])}`).join(' ')});
 if(q.type==='arc')return <path key={i} d={`M ${px(q.x1??10)} ${py(q.y1??32)} Q ${px(q.cx??36)} ${py(q.cy??4)} ${px(q.x2??62)} ${py(q.y2??32)}`}/>;
 if(q.type==='text')return <text key={i} x={px(q.x??36)} y={py(q.y??27)} textAnchor="middle">{q.text||symbol.acronym}</text>;
 return null;
})}</g>;

const BaseLine=({x,cy,width})=><line x1={x} y1={cy} x2={x+width} y2={cy}/>;
const ValveBody=({x,y,width,height})=>{const cx=x+width/2,cy=y+height/2;return <><BaseLine x={x} cy={cy} width={width}/><path d={`M ${x+width*.25} ${y+height*.22} L ${cx} ${cy} L ${x+width*.25} ${y+height*.78} Z M ${x+width*.75} ${y+height*.22} L ${cx} ${cy} L ${x+width*.75} ${y+height*.78} Z`}/></>};

function FittingGlyph({p,x,y,width,height}){
 const cx=x+width/2,cy=y+height/2;
 const line=<BaseLine x={x} cy={cy} width={width}/>;
 if(p==='elbow90'||p==='elbow90-lr')return <g className="symbolGlyph fittingGlyph">{/* LR: flowing quarter bend */}<path d={`M ${x+width*.12} ${y+height*.82} Q ${x+width*.12} ${y+height*.18} ${x+width*.78} ${y+height*.18}`}/><path className="centerMark" d={`M ${x+width*.12} ${cy} L ${x+width*.12} ${y+height*.18} L ${cx} ${y+height*.18}`}/></g>;
 if(p==='elbow90-sr')return <g className="symbolGlyph fittingGlyph"><path d={`M ${x+width*.2} ${y+height*.82} L ${x+width*.2} ${y+height*.28} Q ${x+width*.2} ${y+height*.18} ${x+width*.3} ${y+height*.18} L ${x+width*.8} ${y+height*.18}`}/><path className="detailMark" d={`M ${x+width*.2} ${y+height*.35} L ${x+width*.35} ${y+height*.18}`}/></g>;
 if(p==='elbow45')return <g className="symbolGlyph fittingGlyph"><path d={`M ${x+width*.1} ${y+height*.78} L ${cx} ${cy} L ${x+width*.84} ${y+height*.16}`}/><circle className="jointMark" cx={cx} cy={cy} r={2.2}/></g>;
 if(p==='bend')return <g className="symbolGlyph fittingGlyph"><path d={`M ${x+width*.08} ${y+height*.8} C ${x+width*.28} ${y+height*.8}, ${x+width*.5} ${y+height*.24}, ${x+width*.9} ${y+height*.18}`}/></g>;
 if(p==='miter')return <g className="symbolGlyph fittingGlyph"><polyline points={`${x+width*.08},${y+height*.78} ${x+width*.34},${y+height*.56} ${x+width*.55},${y+height*.36} ${x+width*.86},${y+height*.16}`}/><path className="detailMark" d={`M ${x+width*.31} ${y+height*.49} l 7 7 M ${x+width*.52} ${y+height*.29} l 7 7`}/></g>;
 if(p==='tee'||p==='tee-reducing')return <g className="symbolGlyph fittingGlyph">{line}<line x1={cx} y1={cy} x2={cx} y2={y+height*.05}/>{p==='tee-reducing'&&<><line className="detailMark" x1={cx-5} y1={y+height*.18} x2={cx+5} y2={y+height*.18}/><line className="detailMark" x1={cx-3} y1={y+height*.27} x2={cx+3} y2={y+height*.27}/></>}</g>;
 if(p==='cross')return <g className="symbolGlyph fittingGlyph">{line}<line x1={cx} y1={y+height*.04} x2={cx} y2={y+height*.96}/><circle className="jointMark" cx={cx} cy={cy} r={2}/></g>;
 if(p==='lateral')return <g className="symbolGlyph fittingGlyph">{line}<line x1={cx} y1={cy} x2={x+width*.72} y2={y+height*.04}/><path className="detailMark" d={`M ${cx-5} ${cy-2} l 8 -8`}/></g>;
 if(p==='coupling')return <g className="symbolGlyph fittingGlyph">{line}<rect x={cx-width*.14} y={cy-height*.22} width={width*.28} height={height*.44}/></g>;
 if(p==='half-coupling')return <g className="symbolGlyph fittingGlyph">{line}<path d={`M ${cx-width*.14} ${cy} V ${y+height*.18} H ${cx+width*.14} V ${cy}`}/></g>;
 if(p==='union')return <g className="symbolGlyph fittingGlyph">{line}<path d={`M ${cx-10} ${cy} l 6 -10 h 8 l 6 10 -6 10 h-8z`}/></g>;
 if(p==='nipple')return <g className="symbolGlyph fittingGlyph">{line}<line x1={cx-9} y1={cy-7} x2={cx-9} y2={cy+7}/><line x1={cx+9} y1={cy-7} x2={cx+9} y2={cy+7}/><path className="detailMark" d={`M ${cx-7} ${cy-5} l 4 10 M ${cx-1} ${cy-5} l 4 10 M ${cx+5} ${cy-5} l 4 10`}/></g>;
 if(p==='cap')return <g className="symbolGlyph fittingGlyph"><line x1={x} y1={cy} x2={cx+2} y2={cy}/><path d={`M ${cx+2} ${cy-height*.3} Q ${cx+width*.18} ${cy} ${cx+2} ${cy+height*.3}`}/></g>;
 if(p==='plug')return <g className="symbolGlyph fittingGlyph"><line x1={x} y1={cy} x2={cx-7} y2={cy}/><path d={`M ${cx-7} ${cy-8} H ${cx+5} L ${cx+10} ${cy} L ${cx+5} ${cy+8} H ${cx-7} Z`}/></g>;
 if(['reducer','reducer-concentric'].includes(p))return <g className="symbolGlyph fittingGlyph"><line x1={x} y1={cy} x2={x+width*.2} y2={cy}/><line x1={x+width*.8} y1={cy} x2={x+width} y2={cy}/><path d={`M ${x+width*.2} ${cy-height*.22} L ${x+width*.8} ${cy-height*.1} M ${x+width*.2} ${cy+height*.22} L ${x+width*.8} ${cy+height*.1}`}/></g>;
 if(p==='reducer-eccentric')return <g className="symbolGlyph fittingGlyph"><line x1={x} y1={cy} x2={x+width*.2} y2={cy}/><line x1={x+width*.8} y1={cy} x2={x+width} y2={cy}/><path d={`M ${x+width*.2} ${cy-height*.22} L ${x+width*.8} ${cy-height*.1} M ${x+width*.2} ${cy+height*.12} L ${x+width*.8} ${cy+height*.12}`}/><path className="detailMark" d={`M ${x+width*.25} ${cy+height*.3} H ${x+width*.75}`}/></g>;
 if(p==='swage')return <g className="symbolGlyph fittingGlyph">{line}<path d={`M ${cx-13} ${cy-8} L ${cx+13} ${cy-4} M ${cx-13} ${cy+8} L ${cx+13} ${cy+4}`}/><line className="detailMark" x1={cx} y1={cy-11} x2={cx} y2={cy+11}/></g>;
 if(p.startsWith('olet')||p==='nipolet'||p==='branch-welded'||p==='branch-reinforced')return <g className="symbolGlyph fittingGlyph">{line}<path d={`M ${cx-8} ${cy} Q ${cx} ${cy-8} ${cx+8} ${cy} M ${cx} ${cy-4} V ${y+height*.08}`}/>{p==='olet-socket'&&<rect className="detailMark" x={cx-5} y={y+height*.12} width="10" height="7"/>}{p==='olet-threaded'&&<path className="detailMark" d={`M ${cx-5} ${y+height*.2} l 10 -5 M ${cx-5} ${y+height*.27} l 10 -5`}/>} {p==='branch-reinforced'&&<path className="detailMark" d={`M ${cx-13} ${cy+3} Q ${cx} ${cy-9} ${cx+13} ${cy+3}`}/>} {p==='nipolet'&&<line className="detailMark" x1={cx-5} y1={y+height*.22} x2={cx+5} y2={y+height*.22}/>}</g>;
 if(p==='spectacle-blind')return <g className="symbolGlyph fittingGlyph">{line}<circle cx={cx-8} cy={cy} r={8}/><circle cx={cx+10} cy={cy} r={8}/><line x1={cx} y1={cy-7} x2={cx+2} y2={cy+7}/></g>;
 if(p==='spacer')return <g className="symbolGlyph fittingGlyph">{line}<circle cx={cx} cy={cy} r={9}/><circle className="detailMark" cx={cx} cy={cy} r={4}/></g>;
 return null;
}

function FlangeGlyph({p,x,y,width,height}){
 const cx=x+width/2,cy=y+height/2,line=<BaseLine x={x} cy={cy} width={width}/>;
 const disk=<><line x1={cx-4} y1={y+height*.14} x2={cx-4} y2={y+height*.86}/><line x1={cx+4} y1={y+height*.14} x2={cx+4} y2={y+height*.86}/></>;
 if(p==='flange-pair')return <g className="symbolGlyph flangeGlyph">{line}<line x1={cx-10} y1={y+height*.14} x2={cx-10} y2={y+height*.86}/><line x1={cx-4} y1={y+height*.14} x2={cx-4} y2={y+height*.86}/><line x1={cx+4} y1={y+height*.14} x2={cx+4} y2={y+height*.86}/><line x1={cx+10} y1={y+height*.14} x2={cx+10} y2={y+height*.86}/></g>;
 if(p==='flange-blind')return <g className="symbolGlyph flangeGlyph"><line x1={x} y1={cy} x2={cx-4} y2={cy}/>{disk}<line className="detailMark" x1={cx} y1={y+height*.08} x2={cx} y2={y+height*.92}/></g>;
 if(p==='flange-wn'||p==='flange-long-wn')return <g className="symbolGlyph flangeGlyph">{line}{disk}<path d={`M ${cx-4} ${cy-8} L ${cx-(p==='flange-long-wn'?22:15)} ${cy-3} M ${cx-4} ${cy+8} L ${cx-(p==='flange-long-wn'?22:15)} ${cy+3}`}/></g>;
 if(p==='flange-so')return <g className="symbolGlyph flangeGlyph">{line}{disk}<path className="detailMark" d={`M ${cx-9} ${cy-8} V ${cy+8} M ${cx+9} ${cy-8} V ${cy+8}`}/></g>;
 if(p==='flange-sw')return <g className="symbolGlyph flangeGlyph">{line}{disk}<path className="detailMark" d={`M ${cx-12} ${cy-8} H ${cx-7} V ${cy+8} H ${cx-12}`}/></g>;
 if(p==='flange-lj')return <g className="symbolGlyph flangeGlyph">{line}{disk}<path className="detailMark" d={`M ${cx-11} ${cy-10} V ${cy+10} M ${cx-11} ${cy-6} H ${cx-5} M ${cx-11} ${cy+6} H ${cx-5}`}/></g>;
 if(p==='flange-threaded')return <g className="symbolGlyph flangeGlyph">{line}{disk}<path className="detailMark" d={`M ${cx-11} ${cy-9} l 6 6 M ${cx-11} ${cy-3} l 6 6 M ${cx-11} ${cy+3} l 6 6`}/></g>;
 if(p==='flange-orifice')return <g className="symbolGlyph flangeGlyph">{line}<line x1={cx-8} y1={y+height*.14} x2={cx-8} y2={y+height*.86}/><line x1={cx+8} y1={y+height*.14} x2={cx+8} y2={y+height*.86}/><circle cx={cx} cy={cy} r={3}/><path className="detailMark" d={`M ${cx-8} ${y+height*.14} v -7 M ${cx+8} ${y+height*.14} v -7`}/></g>;
 return <g className="symbolGlyph flangeGlyph">{line}{disk}</g>;
}

function ValveGlyph({p,x,y,width,height}){
 const cx=x+width/2,cy=y+height/2;
 const body=<ValveBody x={x} y={y} width={width} height={height}/>;
 if(p==='valve-globe')return <g className="symbolGlyph valveGlyph">{body}<circle cx={cx} cy={cy} r={height*.13}/><line x1={cx} y1={cy-height*.13} x2={cx} y2={y+height*.06}/><line x1={cx-8} y1={y+height*.06} x2={cx+8} y2={y+height*.06}/></g>;
 if(p==='valve-ball')return <g className="symbolGlyph valveGlyph">{body}<circle cx={cx} cy={cy} r={height*.14}/></g>;
 if(p==='valve-butterfly')return <g className="symbolGlyph valveGlyph"><BaseLine x={x} cy={cy} width={width}/><circle cx={cx} cy={cy} r={height*.26}/><line x1={cx-height*.18} y1={cy-height*.18} x2={cx+height*.18} y2={cy+height*.18}/></g>;
 if(p==='valve-plug')return <g className="symbolGlyph valveGlyph">{body}<rect x={cx-6} y={cy-5} width="12" height="10" transform={`rotate(45 ${cx} ${cy})`}/></g>;
 if(p==='valve-needle')return <g className="symbolGlyph valveGlyph"><BaseLine x={x} cy={cy} width={width}/><path d={`M ${cx-15} ${cy-10} L ${cx} ${cy} L ${cx-15} ${cy+10} M ${cx+15} ${cy-10} L ${cx} ${cy} L ${cx+15} ${cy+10}`}/><line x1={cx} y1={cy-13} x2={cx} y2={cy+13}/></g>;
 if(p==='valve-diaphragm')return <g className="symbolGlyph valveGlyph">{body}<path d={`M ${cx-12} ${cy+3} Q ${cx} ${cy-13} ${cx+12} ${cy+3}`}/></g>;
 if(p==='valve-check'||p==='valve-swing-check')return <g className="symbolGlyph valveGlyph"><BaseLine x={x} cy={cy} width={width}/><path d={`M ${cx-12} ${cy-11} L ${cx+7} ${cy} L ${cx-12} ${cy+11} Z`}/><line x1={cx+9} y1={cy-12} x2={cx+9} y2={cy+12}/>{p==='valve-swing-check'&&<line className="detailMark" x1={cx-8} y1={cy-10} x2={cx+7} y2={cy}/>}</g>;
 if(p==='valve-lift-check')return <g className="symbolGlyph valveGlyph"><BaseLine x={x} cy={cy} width={width}/><rect x={cx-9} y={cy-10} width="18" height="20"/><path d={`M ${cx} ${cy+7} V ${cy-5} M ${cx-5} ${cy} L ${cx} ${cy-6} L ${cx+5} ${cy}`}/></g>;
 if(p==='valve-dual-plate-check')return <g className="symbolGlyph valveGlyph"><BaseLine x={x} cy={cy} width={width}/><circle cx={cx} cy={cy} r={height*.24}/><path d={`M ${cx} ${cy-height*.22} V ${cy+height*.22} M ${cx-10} ${cy-10} L ${cx} ${cy} L ${cx-10} ${cy+10} M ${cx+10} ${cy-10} L ${cx} ${cy} L ${cx+10} ${cy+10}`}/></g>;
 if(p==='valve-control')return <g className="symbolGlyph valveGlyph">{body}<circle cx={cx} cy={cy} r={height*.3}/><line x1={cx} y1={cy-height*.3} x2={cx} y2={y+height*.04}/><path d={`M ${cx-9} ${y+height*.04} Q ${cx} ${y-2} ${cx+9} ${y+height*.04}`}/></g>;
 if(p==='valve-safety'||p==='valve-relief')return <g className="symbolGlyph valveGlyph">{body}<line x1={cx} y1={cy-height*.2} x2={cx} y2={y+height*.12}/><path d={`M ${cx-7} ${y+height*.12} q 7 -7 14 0 q -7 7 -14 14 q 7 7 14 0`}/><path className="detailMark" d={`M ${cx+7} ${y+height*.12} h 10`}/></g>;
 if(['valve-mov','valve-aov','valve-hydraulic','valve-manual'].includes(p)){
  const label=p==='valve-mov'?'M':p==='valve-aov'?'P':p==='valve-hydraulic'?'H':'';
  return <g className="symbolGlyph valveGlyph">{body}<line x1={cx} y1={cy-height*.2} x2={cx} y2={y+height*.12}/>{p==='valve-manual'?<><circle cx={cx} cy={y+height*.08} r={8}/><path d={`M ${cx-7} ${y+height*.08} H ${cx+7} M ${cx} ${y+height*.01} V ${y+height*.15}`}/></>:<><rect x={cx-10} y={y+1} width="20" height="13" rx="3"/><text x={cx} y={y+11} textAnchor="middle">{label}</text></>}</g>;
 }
 return <g className="symbolGlyph valveGlyph">{body}</g>;
}

export function SymbolGlyph({symbol,x,y,width,height}){
 const cx=x+width/2,cy=y+height/2,p=symbol?.primitive||'generic',code=symbol?.instrumentCode||symbol?.acronym||'';
 if(p==='custom')return <CustomGlyph symbol={symbol} x={x} y={y} width={width} height={height}/>;
 if(p==='pipe')return <g className="symbolGlyph pipeLibraryGlyph"><path d={`M ${x+4} ${y+height*.72} L ${x+width*.36} ${y+height*.72} L ${x+width*.57} ${y+height*.35} L ${x+width-4} ${y+height*.35}`}/><circle cx={x+width*.36} cy={y+height*.72} r="2"/><circle cx={x+width*.57} cy={y+height*.35} r="2"/></g>;
 if(p==='pipe-break')return <g className="symbolGlyph pipeLibraryGlyph"><line x1={x+4} y1={cy} x2={cx-9} y2={cy}/><path d={`M ${cx-9} ${cy} l 6 -7 l 6 14 l 6 -14 l 6 7`}/><line x1={cx+9} y1={cy} x2={x+width-4} y2={cy}/></g>;
 if(['elbow90','elbow90-lr','elbow90-sr','elbow45','bend','miter','tee','tee-reducing','cross','lateral','coupling','half-coupling','union','nipple','cap','plug','reducer','reducer-concentric','reducer-eccentric','swage','olet','olet-weld','olet-socket','olet-threaded','nipolet','branch-welded','branch-reinforced','spectacle-blind','spacer'].includes(p))return <FittingGlyph p={p} x={x} y={y} width={width} height={height}/>;
 if(p.startsWith('flange'))return <FlangeGlyph p={p} x={x} y={y} width={width} height={height}/>;
 if(p==='valve'||p.startsWith('valve-'))return <ValveGlyph p={p} x={x} y={y} width={width} height={height}/>;
 if(p==='instrument'||p.startsWith('instrument-'))return <g className="symbolGlyph"><circle cx={cx} cy={cy} r={Math.min(width,height)*.34}/>{p==='instrument-transmitter'&&<line x1={x+width*.18} y1={cy} x2={x+width*.82} y2={cy}/>}<text x={cx} y={cy+4} textAnchor="middle">{code}</text></g>;
 if(p==='north')return <g className="symbolGlyph"><line x1={cx} y1={y+height*.85} x2={cx} y2={y+height*.18}/><path d={`M ${cx} ${y+height*.1} L ${cx-7} ${y+height*.3} L ${cx+7} ${y+height*.3} Z`}/><text x={cx+10} y={y+12}>N</text></g>;
 if(p==='flow')return <g className="symbolGlyph"><BaseLine x={x} cy={cy} width={width}/><path d={`M ${x+width*.78} ${cy} L ${x+width*.62} ${cy-height*.18} L ${x+width*.62} ${cy+height*.18} Z`}/></g>;
 if(p==='vessel'||p==='column'||p==='tank'||p==='reactor')return <g className="symbolGlyph"><rect x={x+width*.28} y={y+height*.08} width={width*.44} height={height*.84} rx={width*.2}/><line x1={cx} y1={y} x2={cx} y2={y+height*.08}/><line x1={cx} y1={y+height*.92} x2={cx} y2={y+height}/></g>;
 if(['pump','compressor'].includes(p))return <g className="symbolGlyph"><circle cx={cx} cy={cy} r={height*.32}/><path d={`M ${cx-height*.12} ${cy-height*.18} L ${cx+height*.22} ${cy} L ${cx-height*.12} ${cy+height*.18} Z`}/></g>;
 if(p==='exchanger')return <g className="symbolGlyph"><rect x={x+width*.1} y={y+height*.2} width={width*.8} height={height*.6} rx={height*.3}/><line x1={x+width*.28} y1={y+height*.25} x2={x+width*.72} y2={y+height*.75}/><line x1={x+width*.28} y1={y+height*.75} x2={x+width*.72} y2={y+height*.25}/></g>;
 if(p.startsWith('support'))return <g className="symbolGlyph"><BaseLine x={x} cy={cy} width={width}/><path d={`M ${cx} ${cy} L ${cx-width*.2} ${y+height*.82} L ${cx+width*.2} ${y+height*.82} Z`}/></g>;
 if(['inspection-point','weld','anomaly','evidence','ndt'].includes(p))return <g className="symbolGlyph"><circle cx={cx} cy={cy} r={height*.3}/><text x={cx} y={cy+4} textAnchor="middle">{code}</text></g>;
 return <g className="symbolGlyph"><rect x={x+2} y={y+2} width={width-4} height={height-4} rx="4"/><text x={cx} y={cy+4} textAnchor="middle">{code}</text></g>;
}

export function SymbolPreview({symbol}){return <svg className="symbolPreview" viewBox="0 0 72 46"><SymbolGlyph symbol={symbol} x={0} y={0} width={72} height={46}/></svg>}
