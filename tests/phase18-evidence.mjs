import fs from 'node:fs';import {createSymbolDetection,recognitionSummary} from '../src/editor-core/symbol-recognition.js';
const samples=[
 {id:'VALVE-CAND-001',bbox:{x:102,y:88,width:42,height:28},features:{familyHint:'valve',ports:2,textHint:'VG'}},
 {id:'TEE-CAND-001',bbox:{x:220,y:120,width:38,height:38},features:{familyHint:'tee',primitiveHint:'tee',ports:3,branchCount:1}},
 {id:'INST-CAND-001',bbox:{x:350,y:70,width:30,height:30},features:{familyHint:'instrument',circularity:.94,textHint:'PI'}},
 {id:'UNKNOWN-CAND-001',bbox:{x:500,y:180,width:12,height:8},features:{aspect:1.5}}
].map(createSymbolDetection);
fs.writeFileSync('../tests/PHASE18_SYMBOL_RECOGNITION_EVIDENCE.json',JSON.stringify({note:'Detecções sintéticas determinísticas para validação do classificador. Não representam reconhecimento validado do PDF industrial real.',samples,summary:recognitionSummary(samples)},null,2));
