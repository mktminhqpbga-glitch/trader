// UI-02 targeted real-browser check: three nodes placed by the real SQLite API
// close to the right boundary. Selecting each must not let Inspector obscure it.
// Run only on isolated Web 5184/API 3114 after ui02-visual-qa.js.
async (page) => {
  const map = (id) => page.locator(`[data-map-id="${id}"]`);
  const assert = (value, message) => { if (!value) throw Error(message); };
  const name = `UI02 right edge ${Date.now().toString(36)}`;
  const api = (path, method = 'GET', payload) => page.evaluate(async ({path,method,payload}) => {
    const response = await fetch(path, {
      method,
      ...(payload !== undefined ? {headers:{'content-type':'application/json'},body:JSON.stringify(payload)} : {}),
    });
    return {status:response.status,body:await response.json()};
  },{path,method,payload});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('http://127.0.0.1:5184/');
  await map('AC.HOME').waitFor();
  await map('AC.HOME.NEW').first().click();
  await map('AC.HOME.NEW.NAME').fill(name);
  await map('AC.HOME.NEW.CREATE').click();
  await map('AC.CANVAS').waitFor();
  const projects = await api('/api/projects');
  const project = projects.body.projects.find(p=>p.name===name);
  assert(project?.id,'Could not create a separate right-edge project');
  for (const type of ['TEXT','IMAGE','VIDEO']) {
    await map('AC.CANVAS.ADD.NODE').click();
    await map(`AC.CANVAS.ADD.NODE.${type}`).click();
  }
  await page.waitForFunction(() => document.querySelector('[data-map-id="AC.CANVAS.SAVE.STATUS"]')?.classList.contains('saved'), null, {timeout:16000});
  const canvasPath = `/api/projects/${project.id}/canvas`;
  const current = await api(canvasPath);
  assert(current.status===200&&current.body.canvas.nodes.length===3,'Expected 3 real nodes');
  const nodes = current.body.canvas.nodes.map((node,i)=>({
    ...node,
    position:{x:1060+i*8,y:110+i*215},
  }));
  // The API is the same production PUT endpoint; QA uses an isolated SQLite DB.
  const placed = await api(canvasPath,'PUT',{
    revision:current.body.canvas.revision,
    nodes,
    edges:current.body.canvas.edges,
    viewport:{x:0,y:0,zoom:1},
  });
  assert(placed.status===200,'Could not persist three positions through real API');
  await page.reload();
  await map('AC.HOME').waitFor();
  await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${project.id}"]`).click();
  await map('AC.CANVAS').waitFor();
  const details=[];
  for (const kind of ['TEXT','IMAGE','VIDEO']) {
    await map(`AC.${kind}.NODE`).locator('.node-drag-handle').click();
    await map('AC.UI.INSPECTOR').waitFor({state:'visible'});
    await page.waitForTimeout(420);
    const node = await map(`AC.${kind}.NODE`).boundingBox();
    const stage = await page.locator('.canvasStage').boundingBox();
    const inspector = await map('AC.UI.INSPECTOR').boundingBox();
    assert(node&&stage&&inspector,`${kind} bounds/Inspector missing`);
    const visible = node.x >= stage.x-1 && node.x+node.width <= stage.x+stage.width+1 &&
      node.y >= stage.y-1 && node.y+node.height <= stage.y+stage.height+1;
    assert(visible && inspector.x >= stage.x+stage.width-2,`${kind} obstructed by Inspector`);
    details.push({kind,visible,nodeRight:node.x+node.width,stageRight:stage.x+stage.width});
    if (kind === 'VIDEO') await page.screenshot({path:'docs/evidence/ui02/UI02-three-nodes-right-edge.png',fullPage:true});
    await map('AC.UI.INSPECTOR.CLOSE').click();
    assert(await map('AC.UI.INSPECTOR').count()===0,`Closing ${kind} inspector failed`);
  }
  await page.waitForFunction(()=>document.querySelector('[data-map-id="AC.CANVAS.SAVE.STATUS"]')?.classList.contains('saved'),null,{timeout:16000});
  const persisted=await api(canvasPath);
  assert(persisted.status===200,'Readback after selecting failed');
  const nodePositions=persisted.body.canvas.nodes.map(n=>({id:n.id,position:n.position}));
  for (const before of nodes) {
    const after=nodePositions.find(n=>n.id===before.id);
    assert(after && JSON.stringify(after.position)===JSON.stringify(before.position), 'Node coordinates changed after selection');
  }
  return {result:'PASS',projectId:project.id,selected:details,coordinatesUnchanged:true,sqliteReadback:true,
    screenshot:'UI02-three-nodes-right-edge.png'};
}
