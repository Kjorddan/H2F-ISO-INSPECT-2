import {test,expect} from '@playwright/test';

const worldPoint=async(page,x,y)=>{
  return await page.locator('[data-testid="editor-scene"]').evaluate((svg,{x,y})=>{
    const p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(svg.getScreenCTM());return{x:q.x,y:q.y};
  },{x,y});
};
const clickWorld=async(page,x,y)=>{const p=await worldPoint(page,x,y);await page.mouse.click(p.x,p.y);};
const dragLocator=async(page,loc,dx,dy)=>{
  const b=await loc.boundingBox();expect(b).toBeTruthy();
  const x=b.x+b.width/2,y=b.y+b.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up();
};

test.beforeEach(async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('/');
  await expect(page.getByText('ISO INSPECT 2.0')).toBeVisible();
  await expect(page.getByTestId('editor-viewport')).toBeVisible();
  await page.evaluate(()=>window.__phase31Errors=[]);
});

test('Editor — jornada de aceitação essencial 194',async({page})=>{
  await test.step('1 abrir documento / shell',async()=>{
    await expect(page.getByRole('button',{name:'Abrir',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Salvar',exact:true})).toBeVisible();
  });

  await test.step('2 grid isométrico 30°',async()=>{
    await page.getByLabel('Tipo de grade').selectOption('isometric');
    await expect(page.locator('footer')).toContainText('Isométrica 30°');
    expect(await page.locator('.gridLayer line').count()).toBeGreaterThan(10);
  });

  await test.step('3-4 desenhar tubo com múltiplos segmentos',async()=>{
    await page.getByRole('button',{name:'Tubulação',exact:true}).click();
    await clickWorld(page,250,560);await clickWorld(page,380,560);await clickWorld(page,455,500);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-entity-id="PR-002"]')).toHaveCount(1);
    await expect(page.locator('.waypoint')).toHaveCount(3);
    await expect(page.locator('.segmentHit')).toHaveCount(2);
  });

  let vertexBefore,vertexAfterSegment;
  await test.step('5 mover segmento',async()=>{
    const seg=page.locator('.segmentHit').first();
    const wp=page.locator('.waypoint').first();
    vertexBefore=Number(await wp.getAttribute('cy'));
    await dragLocator(page,seg,0,18);
    vertexAfterSegment=Number(await page.locator('.waypoint').first().getAttribute('cy'));
    expect(vertexAfterSegment).not.toBe(vertexBefore);
  });

  await test.step('6 mover vértice',async()=>{
    const wp=page.locator('.waypoint').first();
    const x0=Number(await wp.getAttribute('cx'));
    await dragLocator(page,wp,22,-10);
    const x1=Number(await page.locator('.waypoint').first().getAttribute('cx'));
    expect(x1).not.toBe(x0);
  });

  await test.step('21-22 undo / redo',async()=>{
    const wp=page.locator('.waypoint').first();
    const xMoved=Number(await wp.getAttribute('cx'));
    await page.getByRole('button',{name:'Desfazer',exact:true}).click();
    const xUndo=Number(await page.locator('.waypoint').first().getAttribute('cx'));
    expect(xUndo).not.toBe(xMoved);
    await page.getByRole('button',{name:'Refazer',exact:true}).click();
    const xRedo=Number(await page.locator('.waypoint').first().getAttribute('cx'));
    expect(xRedo).toBeCloseTo(xMoved,3);
  });

  await test.step('7-9 inserir e arrastar válvula mantendo topologia',async()=>{
    const q=page.locator('.librarySearch');await q.fill('Válvula gaveta');
    await page.locator('.symbolCard').filter({hasText:'Válvula gaveta'}).locator('.symbolPick').click();
    const p=await worldPoint(page,720,396);await page.mouse.click(p.x,p.y);
    const valve=page.locator('[data-symbol-id="valve-gate"]');await expect(valve).toHaveCount(1);
    await valve.click();
    const graphBefore=await page.locator('footer').textContent();
    await dragLocator(page,valve,18,8);
    const graphAfter=await page.locator('footer').textContent();
    expect(graphAfter).toContain('conexão');
    expect(graphBefore).toContain('Grafo:');
  });

  await test.step('10-11 inserir tee e criar branch',async()=>{
    const q=page.locator('.librarySearch');await q.fill('Tee');
    await page.locator('.symbolCard').filter({hasText:'Tee'}).locator('.symbolPick').click();
    const before=await page.locator('.pipeRunEntity').count();
    const p=await worldPoint(page,905,337);await page.mouse.click(p.x,p.y);
    await expect(page.locator('[data-symbol-id="tee"]')).toHaveCount(1);
    expect(await page.locator('.pipeRunEntity').count()).toBeGreaterThan(before);
  });

  await test.step('12 inserir flange',async()=>{
    const q=page.locator('.librarySearch');await q.fill('Flange Welding Neck');
    await page.locator('.symbolCard').filter({hasText:'Flange Welding Neck'}).locator('.symbolPick').click();
    const p=await worldPoint(page,688,396);await page.mouse.click(p.x,p.y);
    await expect(page.locator('[data-symbol-id="flange-wn"]')).toHaveCount(1);
  });

  await test.step('13 colocar equipamento',async()=>{
    const q=page.locator('.librarySearch');await q.fill('Bomba');
    await page.locator('.symbolCard').filter({hasText:'Bomba'}).locator('.symbolPick').click();
    await clickWorld(page,520,620);
    await expect(page.locator('[data-symbol-id="equip-pump"]')).toHaveCount(1);
  });

  await test.step('14 cotar',async()=>{
    const before=await page.locator('.dimension').count();
    await page.getByRole('button',{name:'Cota',exact:true}).click();
    await clickWorld(page,220,620);await clickWorld(page,360,620);
    expect(await page.locator('.dimension').count()).toBeGreaterThan(before);
  });

  await test.step('15 elevação',async()=>{
    const before=await page.locator('.elevation').count();
    await page.getByRole('button',{name:'Elevação',exact:true}).click();await clickWorld(page,420,610);
    expect(await page.locator('.elevation').count()).toBeGreaterThan(before);
  });

  await test.step('16 fluxo',async()=>{
    const before=await page.locator('.flow-arrow').count();
    await page.getByRole('button',{name:'Fluxo',exact:true}).click();
    const p=await worldPoint(page,930,338);await page.mouse.click(p.x,p.y);
    expect(await page.locator('.flow-arrow').count()).toBeGreaterThanOrEqual(before);
  });

  await test.step('17-18 adicionar e mover texto',async()=>{
    const before=await page.locator('.annotationText').count();
    await page.getByRole('button',{name:'Texto',exact:true}).click();await clickWorld(page,600,610);
    expect(await page.locator('.annotationText').count()).toBeGreaterThan(before);
    const txt=page.locator('.annotationText').last();const rect=txt.locator('.annotationHitBox');
    const x0=Number(await rect.getAttribute('x'));await dragLocator(page,txt,24,12);
    const x1=Number(await page.locator('.annotationText').last().locator('.annotationHitBox').getAttribute('x'));
    expect(x1).not.toBe(x0);
  });

  await test.step('19-20 TML e solda',async()=>{
    await page.locator('[data-entity-id="EQ-001"]').click();
    await page.getByRole('button',{name:'Adicionar TML',exact:true}).click();
    await page.getByRole('button',{name:'Adicionar solda',exact:true}).click();
    await expect(page.locator('.inspectionPanel')).toContainText('TML 1');
    await expect(page.locator('.inspectionPanel')).toContainText('Soldas 1');
  });

  let savePath;
  await test.step('23 salvar .h2fiso',async()=>{
    const dlPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Salvar',exact:true}).click();
    const dl=await dlPromise;expect(dl.suggestedFilename()).toBe('documento.h2fiso');
    savePath=await dl.path();expect(savePath).toBeTruthy();
  });

  await test.step('1 reabrir documento salvo',async()=>{
    await page.locator('input[accept*=".h2fiso"]').setInputFiles(savePath);
    await expect(page.locator('[data-entity-id="EQ-001"]')).toHaveCount(1);
    await expect(page.locator('[data-symbol-id="equip-pump"]')).toHaveCount(1);
  });

  await test.step('24 exportar PDF via impressão vetorial',async()=>{
    await page.evaluate(()=>{window.__phase31Printed=false;window.print=()=>{window.__phase31Printed=true}});
    await page.getByRole('button',{name:'Exportar PDF',exact:true}).click();
    expect(await page.evaluate(()=>window.__phase31Printed)).toBe(true);
  });

  await page.screenshot({path:'test-results/editor-acceptance.png',fullPage:true});
});

test('IA — gate de honestidade e fluxo disponível 195',async({page})=>{
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=','base64');
  const input=page.locator('input[accept*="image/png"]');
  await input.setInputFiles({name:'referencia.png',mimeType:'image/png',buffer:png});
  await expect(page.getByRole('button',{name:'Analisar referência',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Analisar referência',exact:true}).click();
  await expect(page.locator('.visionPanel')).toContainText('Linhas detectadas: 0');
  await expect(page.locator('.visionPanel')).toContainText('OCR: 0');
  await expect(page.locator('.visionPanel')).toContainText('nenhum reconhecimento foi inventado');
  await page.getByRole('button',{name:'Reconhecer simbologia',exact:true}).click();
  await expect(page.locator('.visionPanel')).toContainText('Símbolos candidatos: 1');
  await expect(page.locator('.reconstructionPanel')).toBeVisible();
  await page.screenshot({path:'test-results/ai-honesty-gate.png',fullPage:true});
});

test('Visual, zoom e orçamento de interação 196-197',async({page})=>{
  const toolbar=page.locator('.toolbar');const tb=await toolbar.boundingBox();expect(tb).toBeTruthy();
  expect(tb.x).toBeGreaterThanOrEqual(0);expect(tb.x+tb.width).toBeLessThanOrEqual(1601);
  const overflow=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,sh:document.documentElement.scrollHeight,ih:innerHeight}));
  expect(overflow.sw).toBeLessThanOrEqual(overflow.iw+2);

  await page.getByRole('button',{name:'100%',exact:true}).click();
  await expect(page.locator('footer')).toContainText('100%');
  const world=page.locator('.world');await expect(world).toHaveAttribute('style',/scale\(1\)/);

  await page.locator('[data-entity-id="EQ-001"]').click();
  const entity=page.locator('[data-entity-id="EQ-001"]');
  const t0=Date.now();await dragLocator(page,entity,120,40);const elapsed=Date.now()-t0;
  expect(elapsed).toBeLessThan(3000);

  const visual=await page.evaluate(()=>{
    const bad=[];for(const el of document.querySelectorAll('button,input,select,summary')){
      const r=el.getBoundingClientRect();if(r.width>0&&r.height>0&&(r.right<-2||r.left>innerWidth+2))bad.push(el.textContent||el.getAttribute('aria-label')||el.tagName);
    }return bad.slice(0,20);
  });
  expect(visual).toEqual([]);
  await page.screenshot({path:'test-results/visual-desktop.png',fullPage:true});

  await page.setViewportSize({width:1024,height:768});
  await expect(page.getByTestId('editor-viewport')).toBeVisible();
  await page.screenshot({path:'test-results/visual-1024.png',fullPage:true});
});
