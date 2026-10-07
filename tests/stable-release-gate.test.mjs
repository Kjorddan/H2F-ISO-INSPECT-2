import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const pkg=JSON.parse(read('package.json'));
const main=read('src/main.jsx');
const browserVision=exists('src/editor-core/browser-vision.js')?read('src/editor-core/browser-vision.js'):'';

const checks=[
  {id:'VERSION',pass:pkg.version==='0.32.0',detail:'package.json deve estar em 0.32.0'},
  {id:'BROWSER_E2E',pass:exists('.github/workflows/phase31-browser.yml'),detail:'workflow Playwright/Chrome presente'},
  {id:'WINDOWS_SMOKE',pass:exists('.github/workflows/phase32-windows.yml'),detail:'workflow Windows real presente'},
  {id:'PERFORMANCE_GATE',pass:exists('tests/performance-phase32.test.mjs'),detail:'budgets 1k/5k/10k/20k presentes'},
  {id:'DEDICATED_PDF',pass:main.includes("pdf.save('isometrico.pdf')")&&main.includes("import('svg2pdf.js')"),detail:'exportação PDF dedicada e vetorial'},
  {id:'NATIVE_SAVE_OPEN',pass:main.includes('validateNativePackage')&&main.includes('openDocumentFile'),detail:'save/open .h2fiso no shell'},
  {id:'UNDO_REDO',pass:main.includes('undoHistory')&&main.includes('redoHistory'),detail:'undo/redo do editor expostos'},
  {id:'AI_REAL_RUNTIME',pass:!!browserVision&&main.includes('analyzeUnderlayRaster')&&browserVision.includes('detectLineCandidates')&&browserVision.includes("import('tesseract.js')")&&main.includes('applyResolutionToRecognition')&&main.includes('bindHumanDoubt')&&!main.includes("source:'CV-DEMO'"),detail:'CV, OCR local, HITL e reconstrução devem estar ligados ao shell sem CV-DEMO'},
  {id:'CORPORATE_SIGNOFF',pass:process.env.H2F_CORPORATE_SIGNOFF==='APPROVED',detail:'homologação humana corporativa explícita obrigatória'}
];

const blockers=checks.filter(x=>!x.pass);
const report={
  product:'H2F ISO INSPECT 2.0',
  phase:32,
  requestedRelease:'2.0.0 stable',
  generatedAt:new Date().toISOString(),
  checks,
  blockers:blockers.map(x=>x.id),
  status:blockers.length?'BLOCKED':'READY_FOR_STABLE_RELEASE'
};
fs.writeFileSync('PHASE32_RELEASE_READINESS.json',JSON.stringify(report,null,2));
for(const c of checks)console.log(c.pass?'PASS':'BLOCK',c.id,'-',c.detail);
console.log('PHASE32_RELEASE_STATUS',report.status);
if(process.argv.includes('--enforce')&&blockers.length)process.exitCode=2;
