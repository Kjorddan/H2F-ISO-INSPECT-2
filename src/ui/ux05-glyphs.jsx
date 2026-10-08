// H2F — símbolos vetoriais UX-05, 100% SVG local.
import React from 'react';
import{instrumentTagLayout}from'../editor-core/ux05-geometry.js';
const supportPaths={
  "REST": "M 7 20 H 65 M 27 20 V 28 H 45 V 20 M 22 32 H 50",
  "GUIDE": "M 7 18 H 65 M 25 9 V 32 H 47 V 9",
  "ANCHOR": "M 8 21 H 64 M 26 11 V 35 M 46 11 V 35 M 21 35 H 51",
  "SHOE": "M 7 17 H 65 M 25 17 V 29 H 47 V 17 M 19 33 H 53",
  "HANGER": "M 9 24 H 63 M 36 3 V 20 M 25 3 H 47 M 28 20 Q 36 32 44 20",
  "SPRING": "M 8 28 H 64 M 36 3 V 8 L 30 12 L 42 16 L 30 20 L 42 24 L 36 29",
  "GENERIC": "M 8 20 H 64 M 26 20 L 36 34 L 46 20 M 23 36 H 49",
  "SPECIAL": "M 10 20 H 62 M 28 20 L 24 32 H 48 L 44 20 M 36 3 V 12 M 31 7 H 41",
  "SLIDING": "M 7 18 H 65 M 24 18 V 27 H 48 V 18 M 20 31 H 52 M 24 36 H 48 M 30 39 L 24 36 L 30 33 M 42 33 L 48 36 L 42 39",
  "LINE_STOP": "M 8 22 H 64 M 29 9 V 35 M 43 9 V 35 M 20 29 H 29 M 43 29 H 52",
  "TRUNNION": "M 7 17 H 65 M 36 17 V 35 M 24 35 H 48 M 31 22 H 41",
  "DUMMY_LEG": "M 7 17 H 65 M 36 17 L 46 34 M 33 34 H 56",
  "STANCHION": "M 7 18 H 65 M 29 18 V 34 H 43 V 18 M 21 37 H 51",
  "ROD_HANGER": "M 9 26 H 63 M 36 3 V 23 M 24 3 H 48 M 27 23 Q 36 31 45 23",
  "CLEVIS": "M 9 26 H 63 M 36 3 V 13 M 27 13 H 45 M 27 13 V 30 Q 36 38 45 30 V 13",
  "U_BOLT": "M 8 25 H 64 M 25 8 V 24 Q 36 37 47 24 V 8 M 20 8 H 30 M 42 8 H 52",
  "CLAMP": "M 7 22 H 65 M 24 13 Q 36 1 48 13 M 24 13 V 29 Q 36 41 48 29 V 13 M 21 23 H 51",
  "SADDLE": "M 8 18 H 64 M 19 27 Q 36 37 53 27 L 48 34 H 24 Z M 19 36 H 53",
  "TRAPEZE": "M 9 23 H 63 M 20 3 V 34 H 52 V 3 M 17 3 H 23 M 49 3 H 55",
  "SWAY": "M 8 24 H 64 M 21 3 L 50 35 M 50 3 L 21 35 M 17 35 H 55",
  "SNUBBER": "M 7 24 H 65 M 22 31 L 30 23 M 30 23 L 45 10 M 25 28 L 40 13 M 43 8 L 48 13 M 20 29 L 25 34",
  "VARIABLE_SPRING": "M 9 25 H 63 M 36 2 V 9 L 29 13 L 43 17 L 29 21 L 43 25 M 23 35 H 49 M 25 31 H 47",
  "CONSTANT_SPRING": "M 9 27 H 63 M 36 3 V 10 L 28 14 L 44 18 L 28 22 L 44 26 M 20 33 H 52 M 52 33 V 10 M 17 10 H 57",
  "STRUCTURE": "M 8 18 H 64 M 23 18 V 36 M 49 18 V 36 M 17 36 H 55 M 23 26 L 49 36 M 49 26 L 23 36",
  "RACK": "M 6 18 H 66 M 11 27 H 61 M 17 5 V 39 M 55 5 V 39 M 17 39 H 55",
  "SLEEPER": "M 6 16 H 66 M 23 21 H 49 V 34 H 23 Z M 18 37 H 54",
  "GUIDE_SHOE": "M 7 18 H 65 M 24 18 V 30 H 48 V 18 M 20 11 V 34 M 52 11 V 34 M 16 37 H 56",
  "ANCHOR_BOLT": "M 7 17 H 65 M 26 17 V 34 H 46 V 17 M 20 37 H 52 M 26 34 V 40 M 46 34 V 40",
  "ROLLER": "M 7 18 H 65 M 27 18 V 27 M 45 18 V 27 M 23 34 H 49 M 30 29 A 5 5 0 1 0 40 29 A 5 5 0 1 0 30 29"
};
const equipmentPaths={
  "VESSEL_VERTICAL": "M 26 12 A 10 9 0 0 1 46 12 V 34 A 10 9 0 0 1 26 34 Z M 31 41 V 36 M 41 41 V 36 M 36 12 V 3 M 36 34 V 43",
  "VESSEL_HORIZONTAL": "M 16 12 H 56 A 11 11 0 0 1 56 34 H 16 A 11 11 0 0 1 16 12 Z M 21 34 L 17 42 M 51 34 L 55 42",
  "TOWER": "M 28 7 Q 36 0 44 7 V 39 Q 36 46 28 39 Z M 28 18 H 44 M 28 28 H 44 M 22 42 H 50",
  "DRUM": "M 13 15 H 59 Q 66 23 59 31 H 13 Q 6 23 13 15 Z M 20 31 V 38 M 52 31 V 38",
  "SEPARATOR": "M 14 13 H 58 Q 68 23 58 33 H 14 Q 4 23 14 13 Z M 13 26 H 59 M 26 33 V 41 M 48 33 V 41",
  "EXCHANGER_HORIZONTAL": "M 13 12 H 59 A 10 11 0 0 1 59 34 H 13 A 10 11 0 0 1 13 12 Z M 22 13 V 33 M 50 13 V 33 M 25 19 H 47 M 25 26 H 47",
  "EXCHANGER_VERTICAL": "M 28 7 A 8 7 0 0 1 44 7 V 39 A 8 7 0 0 1 28 39 Z M 28 14 H 44 M 28 34 H 44 M 32 18 V 30 M 40 18 V 30",
  "AIR_COOLER": "M 10 10 H 62 V 28 H 10 Z M 14 14 H 58 M 14 19 H 58 M 14 24 H 58 M 36 29 V 37 M 26 37 Q 36 29 46 37 M 26 37 Q 36 45 46 37",
  "PUMP_CENTRIFUGAL": "M 17 33 Q 10 9 36 10 A 13 13 0 1 1 36 36 L 44 27 L 51 26 L 53 33 M 17 33 L 8 33 M 28 40 H 46",
  "PUMP_RECIPROCATING": "M 12 14 H 48 V 34 H 12 Z M 20 18 H 29 V 30 H 20 Z M 29 24 H 61 M 52 18 V 30 M 17 38 H 45",
  "BLOWER": "M 13 12 Q 43 -1 56 19 Q 67 42 35 38 Q 15 33 13 12 Z M 35 23 L 23 15 L 27 29 Z M 35 23 L 47 13 L 44 30 Z",
  "STRAINER": "M 9 23 H 22 L 30 12 H 45 L 53 23 L 45 34 H 30 L 22 23 H 63 M 30 12 L 45 34 M 45 12 L 30 34",
  "HEATER": "M 17 8 H 55 V 38 H 17 Z M 28 38 V 44 M 44 38 V 44 M 24 31 Q 33 23 27 17 Q 42 24 40 12 Q 52 30 42 33",
  "BOILER": "M 11 13 Q 11 7 17 7 H 55 Q 61 7 61 13 V 34 Q 61 40 55 40 H 17 Q 11 40 11 34 Z M 20 21 H 52 M 20 29 H 52 M 28 40 V 44 M 44 40 V 44",
  "SKID": "M 7 38 H 65 M 12 10 H 60 V 35 H 12 Z M 20 20 A 7 7 0 1 0 34 20 A 7 7 0 1 0 20 20 M 40 13 H 54 V 30 H 40 Z",
  "PACKAGE": "M 9 11 H 63 V 36 H 9 Z M 14 16 H 58 M 14 31 H 58 M 36 16 V 31 M 19 23 H 30",
  "MIXER": "M 24 9 A 12 9 0 0 1 48 9 V 37 A 12 9 0 0 1 24 37 Z M 36 2 V 35 M 28 26 L 44 35 M 44 26 L 28 35",
  "CYCLONE": "M 20 8 H 52 V 21 L 39 40 H 33 L 20 21 Z M 14 14 H 20 M 52 15 H 62 M 33 40 V 45",
  "EJECTOR": "M 8 22 H 25 L 36 13 L 49 21 H 65 M 8 27 H 25 L 36 36 L 49 28 H 65 M 36 13 V 36",
  "VESSEL": "M 26 12 A 10 9 0 0 1 46 12 V 34 A 10 9 0 0 1 26 34 Z",
  "TANK": "M 14 14 A 22 7 0 0 1 58 14 V 36 A 22 7 0 0 1 14 36 Z M 14 14 A 22 7 0 0 0 58 14",
  "COLUMN": "M 30 5 H 42 V 42 H 30 Z M 30 13 H 42 M 30 24 H 42 M 30 34 H 42",
  "REACTOR": "M 25 10 Q 36 -1 47 10 V 36 Q 36 47 25 36 Z M 28 28 L 44 18 M 28 18 L 44 28",
  "EXCHANGER": "M 12 15 H 60 A 8 8 0 0 1 60 31 H 12 A 8 8 0 0 1 12 15 Z M 26 15 L 46 31 M 26 31 L 46 15",
  "PUMP": "M 22 23 A 14 14 0 1 1 50 23 A 14 14 0 1 1 22 23 M 30 17 L 45 23 L 30 29 Z",
  "COMPRESSOR": "M 18 13 L 53 23 L 18 33 Z M 54 23 H 65",
  "FURNACE": "M 16 8 H 56 V 40 H 16 Z M 28 32 Q 20 22 35 12 Q 32 27 44 24 Q 47 37 35 38",
  "FILTER": "M 10 23 H 22 L 29 10 H 43 L 50 23 H 63 M 22 23 L 29 36 H 43 L 50 23 M 28 17 L 45 29 M 28 29 L 45 17",
  "EQUIPMENT": "M 13 10 H 59 V 36 H 13 Z M 19 17 H 53 M 19 24 H 53 M 19 31 H 53",
  "NOZZLE": "M 9 20 H 32 V 13 H 46 V 33 H 32 V 26 H 9 M 46 23 H 64"
};
const normal=({x,y,width,height})=>`translate(${x} ${y}) scale(${width/72} ${height/46})`;
export function SupportGlyph({symbol,x,y,width,height}){
 const v=(symbol.variant||symbol.id?.replace(/^support-/,'').replaceAll('-','_')||'GENERIC').toUpperCase();
 return <g className="symbolGlyph supportGlyph" transform={normal({x,y,width,height})} data-support-kind={v}><path d={supportPaths[v]||supportPaths.GENERIC}/>{v==='ROLLER'&&<circle cx="36" cy="29" r="5"/>}{['SPRING','VARIABLE_SPRING','CONSTANT_SPRING'].includes(v)&&<circle cx="36" cy="12" r="2.3"/>}</g>;
}
export function EquipmentGlyph({symbol,x,y,width,height}){
 const v=(symbol.variant||symbol.id?.replace(/^equip-/,'').replaceAll('-','_')||'EQUIPMENT').toUpperCase();
 return <g className="symbolGlyph equipmentGlyph" transform={normal({x,y,width,height})} data-equipment-kind={v}><path d={equipmentPaths[v]||equipmentPaths.EQUIPMENT}/>{(symbol.portDefinitions||[]).map(p=><circle key={p.id} className="nozzleMark" cx={p.u*72} cy={p.v*46} r="2.1"><title>{`Bocal ${p.id}`}</title></circle>)}</g>;
}
export function InstrumentGlyph({symbol,x,y,width,height}){
 const v=(symbol.variant||symbol.id?.replace(/^inst-/,'').replaceAll('-','_')||'FIELD').toUpperCase();
 const pid=(symbol.usageContexts||[]).includes('P&ID')&&!(symbol.usageContexts||[]).includes('ISOMETRIC');
 const tag=instrumentTagLayout(symbol.displayTag||symbol.instrumentCode||symbol.acronym||'I',36);
 return <g className="symbolGlyph instrumentGlyph" transform={normal({x,y,width,height})} data-instrument-kind={v} data-pid-only={pid?'true':'false'}>
 {['FLOW_ELEMENT','ORIFICE','RESTRICTION'].includes(v)?<><path d="M 3 23 H 69 M 29 11 V 35 M 43 11 V 35"/>{v==='RESTRICTION'?<path d="M 29 14 L 43 32 M 29 32 L 43 14"/>:v==='FLOW_ELEMENT'?<path d="M 29 13 L 43 23 L 29 33"/>:<circle cx="36" cy="23" r="3.5"/>}</>:
 ['THERMOWELL','TAP'].includes(v)?<path d={v==='THERMOWELL'?'M 6 23 H 65 M 36 4 V 21 Q 36 35 43 35 Q 48 35 48 28':'M 6 26 H 66 M 36 26 V 7 M 29 7 H 43'}/>:
 ['GAUGE','LEVEL_GAUGE','SENSOR'].includes(v)?<><circle cx="36" cy="22" r="15"/>{v==='LEVEL_GAUGE'?<path d="M 36 9 V 35 M 32 27 H 40"/>:<path d="M 36 22 L 44 13 M 29 31 H 43"/>}</>:
 <><circle cx="36" cy="23" r="17"/>{['PANEL','CONTROL_ROOM'].includes(v)&&<path d={v==='PANEL'?'M 19 23 H 53':'M 19 17 H 53 M 19 29 H 53'}/>}{['DCS','PLC'].includes(v)&&<path d={v==='DCS'?'M 15 14 L 22 8 H 50 L 57 14 V 32 L 50 39 H 22 L 15 32 Z':'M 19 8 H 53 V 38 H 19 Z'}/>}</>}
 {!['THERMOWELL','TAP','FLOW_ELEMENT','ORIFICE','RESTRICTION','SENSOR'].includes(v)&&<text x="36" y={tag.lines.length===2?20:v==='GAUGE'||v==='LEVEL_GAUGE'?41:27} textAnchor="middle" style={{fontSize:tag.fontSize}}>{tag.lines.map((line,i)=><tspan key={i} x="36" dy={i===0?0:tag.fontSize+1} textLength={line.length>6?32:undefined} lengthAdjust="spacingAndGlyphs">{line}</tspan>)}</text>}
 </g>;
}
