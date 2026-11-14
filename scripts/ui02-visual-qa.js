// UI-02: actual Playwright CLI session, isolated API port 3114, Web 5184 and temporary SQLite.
// Call: npx --yes playwright@1.65.1 cli -s=ui02 run-code --filename scripts/ui02-visual-qa.js
// The script only uses real page interactions for project, node, edge and Inspector actions.
async (page) => {
  const root = 'docs/evidence/ui02';
  const webUrl = 'http://127.0.0.1:5184/';
  const map = id => page.locator(`[data-map-id="${id}"]`);
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const shots = [];
  const jsErrors = [], responses = [];
  const onPageError = e => jsErrors.push(e.message);
  const onResponse = r => { if (r.url().includes('/api/')) responses.push(`${r.request().method()} ${r.status()} ${new URL(r.url()).pathname}`); };
  const shot = async name => { await page.screenshot({path:`${root}/${name}.png`,fullPage:true}); shots.push(name); };
  const api = path => page.evaluate(async path => {const r=await fetch(path); return {status:r.status,body:await r.json()};},path);
  const unique = `UI02 ${Date.now().toString(36)}`;
  page.on('pageerror',onPageError);page.on('response',onResponse);
  try {
    await page.setViewportSize({width:1440,height:900});
    await page.goto(webUrl); await map('AC.HOME').waitFor({state:'visible'});
    assert(await map('AC.UI.TOPBAR').count()===1 && await map('AC.UI.LEFT.RAIL').count()===1,'Studio Shell MapID missing');
    await shot('UI02-project-library-empty');
    const makeProject = async name => {
      await map('AC.HOME.NEW').first().click();
      await map('AC.HOME.NEW.NAME').fill(name);await map('AC.HOME.NEW.CREATE').click();
      await map('AC.CANVAS').waitFor({state:'visible'});
      const list=await api('/api/projects');assert(list.status===200,'GET projects failed');
      const p=list.body.projects.find(p=>p.name===name);assert(p?.id,'New project missing '+name);
      return p.id;
    };
    const id = await makeProject(`${unique} · Phim ngắn`);
    await shot('UI02-canvas-empty');
    const others=['Bộ ảnh ý tưởng','Phác thảo cảnh mở đầu','Kịch bản mùa thu'];
    for(const name of others){await map('AC.HOME.PROJECTS').click(); await map('AC.HOME').waitFor({state:'visible'}); await makeProject(`${unique} · ${name}`);}
    await map('AC.HOME.PROJECTS').click();await map('AC.HOME').waitFor({state:'visible'});
    // Capture the settled real UI, not short-lived success toast notifications.
    await page.locator('.el-message').first().waitFor({state:'detached',timeout:12000});
    await shot('UI02-project-library');
    const search=page.locator('.librarySearch input');await search.fill(`${unique} · Phim ngắn`);
    assert(await map('AC.HOME.OPEN').count()===1,'Project search did not filter');
    await search.fill('');
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();await map('AC.CANVAS').waitFor({state:'visible'});
    const addNode=async type=>{await map('AC.CANVAS.ADD.NODE').click();await map(`AC.CANVAS.ADD.NODE.${type}`).click();};
    await map('AC.CANVAS.ADD.NODE').click();await map('AC.UI.NODE.PALETTE').waitFor({state:'visible'});
    await map('AC.UI.NODE.SEARCH').fill('video');assert(await map('AC.CANVAS.ADD.NODE.VIDEO').count()===1,'Palette search video failed');
    assert(await map('AC.CANVAS.ADD.NODE.TEXT').count()===0,'Palette did not filter');
    await map('AC.UI.NODE.SEARCH').fill(''); await shot('UI02-node-menu');
    await map('AC.CANVAS.ADD.NODE.TEXT').click();await shot('UI02-one-node');
    await addNode('IMAGE');await addNode('VIDEO');
    const fillNode = async(type,value)=>{
      const prompt=map(`AC.${type}.PROMPT`);
      if(!await prompt.isVisible()){
        const toggle=map(`AC.${type}.NODE`).locator('[data-map-id="AC.UI02.NODE.PROMPT.TOGGLE"]');
        assert(await toggle.count()>0,`Prompt ${type} collapsed with no expansion control`);
        await toggle.click();
      }
      await prompt.fill(value);
    };
    await fillNode('TEXT','Một buổi sáng trên phố cổ. Ánh sáng xiên, nhân vật đi qua khung cửa.');
    await fillNode('IMAGE','Ánh sáng điện ảnh từ cửa sổ, bóng đổ dài, nhân vật nhỏ trong khung hình.');
    await fillNode('VIDEO','Dolly in chậm qua khung cửa, máy quay ổn định, không khí buổi sớm.');
    await map('AC.CANVAS.FIT').click();await page.waitForTimeout(550);
    const connect = async(source,target)=>{
      const a=await map(source).boundingBox(),b=await map(target).boundingBox();assert(a&&b,`Missing handles ${source} / ${target}`);
      await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();
      await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:28});await page.mouse.up();await page.waitForTimeout(240);
    };
    await connect('AC.TEXT.OUTPUT','AC.IMAGE.INPUT');
    await connect('AC.IMAGE.OUTPUT','AC.VIDEO.INPUT');
    await connect('AC.TEXT.OUTPUT','AC.VIDEO.INPUT');
    assert(await page.locator('.vue-flow__edge').count()===3,'Three node edges not created');
    await map('AC.CANVAS.FIT').click();await page.waitForTimeout(500);
    await shot('UI02-three-nodes');
    await map('AC.IMAGE.NODE').locator('.node-drag-handle').click();await map('AC.UI.INSPECTOR').waitFor({state:'visible'});
    await shot('UI02-image-selected');await shot('UI02-inspector-open');
    const imageText='Hình ảnh kiến trúc, nắng buổi sớm, người đi trong mái vòm.';
    await map('AC.UI.INSPECTOR.PROMPT').fill(imageText);
    assert(await map('AC.IMAGE.PROMPT').inputValue()===imageText,'Inspector and node prompt desynchronized');
    const inspector=await map('AC.UI.INSPECTOR').boundingBox(); const stage=await page.locator('.canvasStage').boundingBox();
    assert(inspector&&stage&&inspector.x>=stage.x+stage.width-2,'Inspector overlaps Canvas stage instead of reserving space');
    await map('AC.UI.INSPECTOR.CLOSE').click();assert(await map('AC.UI.INSPECTOR').count()===0,'Inspector did not close');
    await shot('UI02-inspector-closed');
    await map('AC.VIDEO.NODE').locator('.node-drag-handle').click();await map('AC.UI.INSPECTOR').waitFor({state:'visible'});
    await shot('UI02-video-selected');
    await map('AC.UI.INSPECTOR.CLOSE').click();
    // Four more nodes in a single real project; no synthetic media/results are inserted.
    await addNode('TEXT');await addNode('IMAGE');await addNode('VIDEO');await addNode('IMAGE');
    await map('AC.CANVAS.FIT').click();await page.waitForTimeout(550);
    assert(await page.locator('.vue-flow__node').count()===7,'Multiple node Canvas count wrong');
    await shot('UI02-multiple-nodes');
    // Preserve the camera and data IDs after refresh. No post-load auto-relayout.
    const getCanvas=async()=>{const r=await api(`/api/projects/${id}/canvas`);assert(r.status===200,'Canvas API failed');return r.body.canvas;};
    let before;
    for(let i=0;i<65;i++){const c=await getCanvas();if(c.nodes.length===7&&c.edges.length===3&&c.nodes.some(n=>n.data.content===imageText)){before=c;break;}await page.waitForTimeout(220);}
    assert(before,'Multiple node Canvas not persisted');
    const snap=c=>JSON.stringify({id:c.id,revision:c.revision,viewport:c.viewport,nodes:c.nodes.map(n=>({id:n.id,type:n.type,position:n.position,content:n.data.content})),edges:c.edges.map(e=>({id:e.id,source:e.source,target:e.target,sourceHandle:e.sourceHandle,targetHandle:e.targetHandle}))});
    await page.reload(); await map('AC.HOME').waitFor({state:'visible'});
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();await map('AC.CANVAS').waitFor({state:'visible'});
    assert(snap(before)===snap(await getCanvas()),'SQLite project/canvas/node/edge/viewport snapshot changed on reload');
    assert(jsErrors.length===0,'Browser JS errors: '+jsErrors.join('; '));
    for(const [w,h] of [[1280,800],[1024,768],[390,844]]){
      await page.setViewportSize({width:w,height:h});await shot(`UI02-multiple-nodes-${w}x${h}`);
      await map('AC.HOME.PROJECTS').click();await map('AC.HOME').waitFor({state:'visible'});
      await shot(`UI02-project-library-${w}x${h}`);
      await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click(); await map('AC.CANVAS').waitFor({state:'visible'});
    }
    return {result:'PASS',projectId:id,screenshots:shots,nodeCount:7,edgeCount:3,inspectorReserved:true,sqliteReload:true,javascriptErrors:jsErrors,recentApiResponses:responses.slice(-20)};
  } finally {page.off('pageerror',onPageError);page.off('response',onResponse);}
}
