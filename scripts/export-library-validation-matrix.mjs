import fs from'node:fs';
import path from'node:path';
import{BUILTIN_SYMBOLS,buildLibraryValidationMatrix,libraryStats,validateLibrary,LIBRARY_SCHEMA_VERSION}from'../src/editor-core/library.js';

const out=process.argv[2]||'artifacts/ux03-library-validation.json';
fs.mkdirSync(path.dirname(out),{recursive:true});
const validation=validateLibrary();
if(!validation.valid)throw new Error('Library schema invalid: '+validation.issues.join(', '));
const payload={
 product:'H2F ISO INSPECT 2.0',
 phase:'UX-03',
 schemaVersion:LIBRARY_SCHEMA_VERSION,
 generatedAt:new Date().toISOString(),
 stats:libraryStats(BUILTIN_SYMBOLS),
 rows:buildLibraryValidationMatrix(BUILTIN_SYMBOLS)
};
fs.writeFileSync(out,JSON.stringify(payload,null,2));
console.log(`UX03_MATRIX_ROWS=${payload.rows.length}`);
console.log(`UX03_MATRIX_PATH=${out}`);
