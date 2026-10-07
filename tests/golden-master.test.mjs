import assert from 'node:assert/strict'
import {existsSync,readFileSync} from 'node:fs'
import {createStructuralGolden,validateStructuralGolden,createVectorGolden,compareVectorGolden,validateIndustrialReferenceManifest,browserVisualGate,summarizeGoldenValidation,GOLDEN_STATUS} from '../src/editor-core/golden-master.js'
const pass=(n)=>console.log('PASS '+n)
let g=createStructuralGolden(['menus','layers','bibliotecas']); assert.equal(validateStructuralGolden(g,['menus','layers','bibliotecas']).status,'PASS'); pass('structural complete')
assert.deepEqual(validateStructuralGolden(g,['menus']).missing,['bibliotecas','layers']); pass('structural missing')
let v=createVectorGolden('<svg>  <path d="M0 0"/> </svg>'); assert.equal(compareVectorGolden(v,'<svg><path d="M0 0"/></svg>').status,'PASS'); pass('vector normalized stable')
assert.equal(compareVectorGolden(v,'<svg><path d="M1 0"/></svg>').status,'FAIL'); pass('vector detects change')
const manifestCandidates=[
  new URL('../golden_dataset/GOLDEN_DATASET_MANIFEST.json',import.meta.url),
  new URL('../../golden_dataset/GOLDEN_DATASET_MANIFEST.json',import.meta.url)
]
const manifestUrl=manifestCandidates.find(x=>existsSync(x))
assert.ok(manifestUrl,'Golden Dataset manifest must be available in repository-root or cumulative-package layout')
const m=JSON.parse(readFileSync(manifestUrl,'utf8')); assert.equal(m.page_count,9); pass('real industrial dataset 9 pages')
assert.equal(m.source_sha256,'1d3a283e6dc0a862d4d6a11567926fc5cb4d1dfef7541252ede1532cee3f5802'); pass('real PDF hash stable')
assert.equal(validateIndustrialReferenceManifest(m).status,'PASS'); pass('industrial manifest valid')
assert.equal(m.pages.every(p=>p.text_chars===0),true); pass('vectorized text characteristic retained')
assert.equal(m.pages.every(p=>p.embedded_images===0),true); pass('no embedded raster images characteristic retained')
assert.equal(m.pages.every(p=>p.vector_drawings>30000),true); pass('vector-rich pages retained')
assert.equal(m.pages.every(p=>/^[a-f0-9]{64}$/.test(p.render_sha256)),true); pass('all page render hashes valid')
assert.equal(browserVisualGate({}).status,GOLDEN_STATUS.PENDING_ENVIRONMENT); pass('browser visual gate honest')
assert.equal(browserVisualGate({browserAvailable:true,screenshots:9,perceptualDiffRun:true}).status,'PASS'); pass('browser visual gate pass conditions')
const s=summarizeGoldenValidation({structural:[{status:'PASS'}],vector:[{status:'PASS'}],visual:[{status:'PENDING_ENVIRONMENT'}]}); assert.equal(s.pass,2); assert.equal(s.pendingEnvironment,1); pass('summary')
console.log('Golden Master Core: 14/14 PASS')
