import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'public','tesseract');
const coreOut=path.join(out,'core');
const langOut=path.join(out,'lang');
fs.mkdirSync(coreOut,{recursive:true});
fs.mkdirSync(langOut,{recursive:true});

const mustCopy=(src,dst)=>{
  if(!fs.existsSync(src))throw new Error('OCR asset not found: '+src);
  fs.copyFileSync(src,dst);
  console.log('OCR_ASSET',path.relative(root,dst));
};

mustCopy(
  path.join(root,'node_modules','tesseract.js','dist','worker.min.js'),
  path.join(out,'worker.min.js')
);

const coreDir=path.join(root,'node_modules','tesseract.js-core');
const coreFiles=fs.readdirSync(coreDir).filter(n=>/^tesseract-core.*\.(?:js|wasm)$/.test(n));
if(coreFiles.length<4)throw new Error('Expected tesseract.js-core assets, found '+coreFiles.length);
for(const name of coreFiles)mustCopy(path.join(coreDir,name),path.join(coreOut,name));

const langCandidates=[
  path.join(root,'node_modules','@tesseract.js-data','por','4.0.0_best_int','por.traineddata.gz'),
  path.join(root,'node_modules','@tesseract.js-data','por','4.0.0','por.traineddata.gz')
];
const langSrc=langCandidates.find(fs.existsSync);
if(!langSrc)throw new Error('Portuguese traineddata not found in @tesseract.js-data/por');
mustCopy(langSrc,path.join(langOut,'por.traineddata.gz'));

console.log('OCR_ASSETS_READY',coreFiles.length+2);
