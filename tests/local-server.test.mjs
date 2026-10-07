import fs from 'node:fs'
import path from 'node:path'

const root=path.resolve(new URL('..',import.meta.url).pathname)
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
let pass=0
const ok=(name,cond)=>{if(!cond)throw new Error('FAIL '+name);console.log('PASS '+name);pass++}

const config=JSON.parse(read('local-server/config/server.json'))
const server=read('local-server/server/H2F.LocalServer.ps1')
const start=read('local-server/INICIAR_H2F_ISO_INSPECT.bat')
const stop=read('local-server/PARAR_H2F_ISO_INSPECT.bat')
const open=read('local-server/ABRIR_H2F_ISO_INSPECT.bat')
const guide=read('local-server/README_LOCAL.md')
const workflow=read('.github/workflows/rc30-local.yml')

ok('local server defaults to loopback',config.host==='127.0.0.1')
ok('local server default port 8787',config.port===8787)
ok('PowerShell server uses TcpListener',server.includes('System.Net.Sockets.TcpListener'))
ok('local health endpoint exists',server.includes('/__health'))
ok('path traversal guard exists',server.includes('StartsWith($rootFull'))
ok('webmanifest MIME supported',server.includes('application/manifest+json'))
ok('start launcher uses Windows PowerShell',start.includes('powershell.exe'))
ok('start launcher reads configured port',start.includes('config\\server.json')&&start.includes('ConvertFrom-Json'))
ok('stop launcher validates H2F process',stop.includes('H2F\\.LocalServer\\.ps1'))
ok('browser launcher prefers Chrome',open.includes('Google\\Chrome\\Application\\chrome.exe'))
ok('local guide states no Python requirement',/Não requer Python/i.test(guide))
ok('local guide states no Node requirement',/Node\.js/i.test(guide))
ok('workflow copies compiled dist',workflow.includes('cp -a dist/.'))
ok('workflow uploads offline ZIP artifact',workflow.includes('actions/upload-artifact@v4'))

console.log(`Local Server RC30: ${pass}/14 PASS`)
