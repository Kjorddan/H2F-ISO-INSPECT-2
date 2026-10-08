import {test,expect} from '@playwright/test';

const worldPoint=async(page,x,y)=>page.locator('[data-testid="editor-scene"]').evaluate((svg,{x,y})=>{
 const p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(svg.getScreenCTM());return{x:q.x,y:q.y};
},{x,y});
const clickWorld=async(page,x,y)=>{const p=await worldPoint(page,x,y);await page.mouse.click(p.x,p.y)};
const choose=async(page,name)=>{
 const q=page.locator('.librarySearch');await q.fill(name);
 const card=page.locator('.symbolCard').filter({hasText:name}).first();
 await expect(card).toBeVisible();
 await card.locator('.symbolPick').click();
};

test.beforeEach(async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await expect(page.getByText('ISO INSPECT 2.0')).toBeVisible();
 await expect(page.locator('.libraryPanel')).toBeVisible();
});

test('biblioteca UX-04 diferencia fitting, flange e válvula por geometria',async({page})=>{
 const q=page.locator('.librarySearch');

 await q.fill('Cotovelo 90');
 const lr=page.locator('.symbolCard').filter({hasText:'Cotovelo 90° LR'}).locator('svg');
 const sr=page.locator('.symbolCard').filter({hasText:'Cotovelo 90° SR'}).locator('svg');
 await expect(lr).toBeVisible();await expect(sr).toBeVisible();
 expect(await lr.innerHTML()).not.toBe(await sr.innerHTML());

 await q.fill('Redução');
 const rc=page.locator('.symbolCard').filter({hasText:'Redução concêntrica'}).locator('svg');
 const re=page.locator('.symbolCard').filter({hasText:'Redução excêntrica'}).locator('svg');
 await expect(rc).toBeVisible();await expect(re).toBeVisible();
 expect(await rc.innerHTML()).not.toBe(await re.innerHTML());

 await q.fill('Flange');
 const wn=page.locator('.symbolCard').filter({hasText:'Flange Welding Neck'}).locator('svg').first();
 const so=page.locator('.symbolCard').filter({hasText:'Flange Slip-On'}).locator('svg').first();
 await expect(wn).toBeVisible();await expect(so).toBeVisible();
 expect(await wn.innerHTML()).not.toBe(await so.innerHTML());

 await q.fill('retenção');
 const swing=page.locator('.symbolCard').filter({hasText:'portinhola'}).locator('svg');
 const lift=page.locator('.symbolCard').filter({hasText:'lift'}).locator('svg');
 const dual=page.locator('.symbolCard').filter({hasText:'dual plate'}).locator('svg');
 await expect(swing).toBeVisible();await expect(lift).toBeVisible();await expect(dual).toBeVisible();
 const sigs=await Promise.all([swing.innerHTML(),lift.innerHTML(),dual.innerHTML()]);
 expect(new Set(sigs).size).toBe(3);

 await q.fill('');
 await page.screenshot({path:'test-results/ux04-library-overview.png',fullPage:true});
});

test('estilo visual de PipeRun é independente dos dados de engenharia',async({page})=>{
 await page.locator('[data-entity-id="PR-001"]').click();
 const line=page.getByLabel('Line Number');const before=await line.inputValue();
 const style=page.getByLabel('Estilo visual');
 await style.selectOption('FUTURE');
 await expect(page.locator('[data-entity-id="PR-001"]')).toHaveAttribute('data-pipe-style','FUTURE');
 const dash=await page.locator('[data-entity-id="PR-001"] .pipeCenterline').evaluate(el=>getComputedStyle(el).strokeDasharray);
 expect(dash).not.toBe('none');
 expect(await line.inputValue()).toBe(before);

 await style.selectOption('JACKETED');
 await expect(page.locator('[data-entity-id="PR-001"]')).toHaveAttribute('data-pipe-style','JACKETED');
 await expect(page.locator('[data-entity-id="PR-001"] .pipeSecondary')).toHaveCount(1);
 expect(await line.inputValue()).toBe(before);
 await page.screenshot({path:'test-results/ux04-pipe-style.png',fullPage:true});
});

test('cross inserido no trecho cria quatro runs e quatro conexões explícitas',async({page})=>{
 await choose(page,'Cruzeta');
 await clickWorld(page,730,390);
 await expect(page.locator('[data-symbol-id="cross"]')).toHaveCount(1);
 await expect(page.locator('.pipeRunEntity')).toHaveCount(4);
 await expect(page.locator('footer')).toContainText('Grafo: 4 runs');
 await expect(page.locator('footer')).toContainText('4 conexões');
 await page.screenshot({path:'test-results/ux04-cross-topology.png',fullPage:true});
});

test('weldolet cria branch anexado sem quebrar o run principal',async({page})=>{
 await choose(page,'Weldolet');
 await clickWorld(page,730,390);
 await expect(page.locator('[data-symbol-id="weldolet"]')).toHaveCount(1);
 await expect(page.locator('.pipeRunEntity')).toHaveCount(2);
 await expect(page.locator('footer')).toContainText('Grafo: 2 runs');
 await expect(page.locator('footer')).toContainText('1 conexão');
 await page.screenshot({path:'test-results/ux04-weldolet-attachment.png',fullPage:true});
});

test('flange cego conecta no endpoint sem dividir a tubulação',async({page})=>{
 await choose(page,'Flange cego');
 await clickWorld(page,675,390);
 await expect(page.locator('[data-symbol-id="flange-blind"]')).toHaveCount(1);
 await expect(page.locator('.pipeRunEntity')).toHaveCount(1);
 await expect(page.locator('footer')).toContainText('Grafo: 1 runs');
 await expect(page.locator('footer')).toContainText('1 conexão');
 await page.screenshot({path:'test-results/ux04-blind-terminal.png',fullPage:true});
});

test('válvula inline continua dividindo o run com duas conexões',async({page})=>{
 await choose(page,'Válvula gaveta');
 await clickWorld(page,730,390);
 await expect(page.locator('[data-symbol-id="valve-gate"]')).toHaveCount(1);
 await expect(page.locator('.pipeRunEntity')).toHaveCount(2);
 await expect(page.locator('footer')).toContainText('Grafo: 2 runs');
 await expect(page.locator('footer')).toContainText('2 conexões');
 await page.screenshot({path:'test-results/ux04-valve-inline.png',fullPage:true});
});
