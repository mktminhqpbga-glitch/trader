// AC-02C end-to-end REAL UI interactions. Isolated AC_PORT=<isolated-port> AC_WEB_PORT=5184.
// npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02c-browser-flow.js
async (page) => {
  // This Playwright CLI browser script targets the isolated UI-01 test server (port 5184).
  const webUrl = 'http://127.0.0.1:5184/';
  const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
  const map = id => page.locator(`[data-map-id="${id}"]`);
  const item = id => page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`);
  const projectMenu = id => page.locator(`[data-map-id="AC.HOME.PROJECT.MENU"][data-project-id="${id}"]`);
  const openLibrary = async () => {
    if (await map('AC.CANVAS').count() && !await page.locator('.canvasLibraryDrawer').count()) {
      await map('AC.UI.PANEL.TOGGLE').click();
      await page.locator('.canvasLibraryDrawer').waitFor({state:'visible'});
    }
  };
  const closeLibrary = async () => {
    if (await page.locator('.canvasLibraryDrawer').count()) {
      await map('AC.UI.PANEL.TOGGLE').click();
      await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
    }
  };
  const openProjectCard = async id => {
    await openLibrary();
    await item(id).click();
    await map('AC.CANVAS').waitFor({state:'visible'});
    await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
  };
  const api = async (path,method='GET',body) => page.evaluate(async ({path,method,body}) => {
    const response=await fetch(path,{method,...(body === undefined ? {} : {
      headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
    return {status:response.status,body:await response.json()};
  },{path,method,body});
  const getCanvas = async id => {
    const result=await api(`/api/projects/${id}/canvas`);
    assert(result.status===200,`GET canvas ${id}: ${result.status}`);
    return result.body.canvas;
  };
  const snap = c => ({id:c.id,revision:c.revision,viewport:c.viewport,
    nodes:c.nodes.map(n=>({id:n.id,type:n.type,content:n.data.content,position:n.position})),
    edges:c.edges.map(e=>({id:e.id,source:e.source,target:e.target,
      sourceHandle:e.sourceHandle,targetHandle:e.targetHandle}))});
  const create = async name => {
    await page.locator('.sidebar [data-map-id="AC.HOME.NEW"]').last().click();
    await map('AC.HOME.NEW.NAME').fill(name);
    await map('AC.HOME.NEW.CREATE').click();
    await map('AC.CANVAS').waitFor({state:'visible'});
    await page.waitForFunction(expectedName => document.querySelector('.topbarProjectName')?.textContent?.includes(expectedName),
      name, {timeout:12000});
    await openLibrary();
    const id = await page.locator('.projectItem.active').getAttribute('data-project-id');
    await closeLibrary();
    return id;
  };
  const add = async type => {
    await map('AC.CANVAS.ADD.NODE').click();
    await map(`AC.CANVAS.ADD.NODE.${type}`).click();
    await map(`AC.${type}.NODE`).waitFor({state:'visible'});
  };
  const connect = async (source,target) => {
    const a=await map(source).boundingBox(), b=await map(target).boundingBox();
    assert(a&&b,`Missing handles ${source} or ${target}`);
    const x=a.x+a.width/2,y=a.y+a.height/2,u=b.x+b.width/2,v=b.y+b.height/2;
    await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move((x+u)/2,(y+v)/2,{steps:16});
    await page.mouse.move(u,v,{steps:20});await page.mouse.up();
    await page.waitForTimeout(240);
  };
  const awaitSaved=async (id,nodes,edges) => {
    for(let i=0;i<65;i++) {
      const data=await getCanvas(id);
      if(data.nodes.length===nodes && data.edges.length===edges &&
        (await map('AC.CANVAS.SAVE.STATUS').getAttribute('class'))?.includes('saved')) return data;
      await page.waitForTimeout(240);
    }
    throw new Error(`SQLite autosave timeout ${id} ${nodes} nodes ${edges} edges`);
  };
  const action = async (id,act) => {
    await openLibrary();
    await projectMenu(id).click();
    await page.locator(`[data-map-id="AC.HOME.PROJECT.${act}"][data-project-id="${id}"]`).click();
  };
  const requests=[],runtimeErrors=[];
  const onResponse=res=>{if(res.url().includes('/api/')) requests.push(`${res.request().method()} ${new URL(res.url()).pathname} ${res.status()}`);};
  const onPageError=err=>runtimeErrors.push(err.message);
  page.on('response',onResponse);page.on('pageerror',onPageError);
  try {
    await page.setViewportSize({width:1600,height:1000});
    await page.goto(webUrl);
    await map('AC.SYSTEM.HEALTH').waitFor({state:'visible'});
    const health=await api('/api/health');
    assert(health.status===200 && health.body.schemaVersion===4, 'Schema migration to v4 not active');
    const nameA='AC02C Project A '+Date.now().toString(36);
    const idA=await create(nameA);
    assert(idA,'Project A missing ID');
    for(const type of ['TEXT','IMAGE','VIDEO']) await add(type);
    const prompts={TEXT:'AC02C A: cau chuyen san sang',IMAGE:'AC02C A: binh minh tren bien',VIDEO:'AC02C A: camera bay ngang qua bien'};
    for(const [type,content] of Object.entries(prompts)) await map(`AC.${type}.PROMPT`).fill(content);
    await map('AC.CANVAS.FIT').click();await page.waitForTimeout(500);
    const title=await map('AC.TEXT.NODE').locator('.node-drag-handle').boundingBox();
    assert(title,'Text Node drag area missing');
    await page.mouse.move(title.x+title.width*.4,title.y+title.height*.55);
    await page.mouse.down();await page.mouse.move(title.x+title.width*.4-35,title.y+title.height*.55-42,{steps:14});await page.mouse.up();
    await map('AC.CANVAS.FIT').click();await page.waitForTimeout(450);
    await connect('AC.TEXT.OUTPUT','AC.IMAGE.INPUT');
    await connect('AC.IMAGE.OUTPUT','AC.VIDEO.INPUT');
    await connect('AC.TEXT.OUTPUT','AC.VIDEO.INPUT');
    assert(await page.locator('.vue-flow__edge').count()===3,'Could not drag all three edges by mouse');
    const savedA=snap(await awaitSaved(idA,3,3));
    assert(savedA.nodes.every(n=>prompts[n.type.toUpperCase()]===n.content),'Three prompts not persisted');
    assert(new Set(savedA.nodes.map(n=>n.id)).size===3 && new Set(savedA.edges.map(e=>e.id)).size===3,'Duplicate node/edge IDs');
    const rename='AC02C Du an A da doi ten';

    // Simulate an API outage: UI must keep old project name and expose an error.
    await action(idA,'RENAME');
    await map('AC.HOME.PROJECT.RENAME.NAME').fill(rename);
    await page.route(`**/api/projects/${idA}`,async route=>{
      if(route.request().method()==='PATCH') await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'AC02C test loi doi ten'})});
      else await route.continue();
    });
    await map('AC.HOME.PROJECT.RENAME.CONFIRM').click();
    await page.waitForTimeout(220);
    assert((await item(idA).innerText()).includes(nameA),'Failed rename changed old name optimistically');
    const failed=await api(`/api/projects/${idA}`);
    assert(failed.status===200 && failed.body.project.name===nameA,'Failed PATCH mutated backend project');
    await page.unroute(`**/api/projects/${idA}`);
    // A failed rename may leave dialog open for safe retry.
    if(await map('AC.HOME.PROJECT.RENAME.DIALOG').isVisible()) {
      await map('AC.HOME.PROJECT.RENAME.CONFIRM').click();
    } else {
      await action(idA,'RENAME');
      await map('AC.HOME.PROJECT.RENAME.NAME').fill(rename);
      await map('AC.HOME.PROJECT.RENAME.CONFIRM').click();
    }
    await page.waitForFunction(({id,name})=>{
      const node=document.querySelector(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`);
      return node?.textContent?.includes(name);
    },{id:idA,name:rename},{timeout:12000});
    const renamed=await api(`/api/projects/${idA}`);
    assert(renamed.status===200&&renamed.body.project.name===rename,'Rename did not persist');
    assert(JSON.stringify(snap(renamed.body.canvas))===JSON.stringify(savedA),'Rename corrupted canvas/revision');
    await page.reload();
    await openProjectCard(idA);
    await map('AC.IMAGE.PROMPT').waitFor({state:'visible'});
    assert((await page.locator('.topbarProjectName').innerText()).includes(rename),'Name lost on refresh');
    assert(JSON.stringify(snap(await getCanvas(idA)))===JSON.stringify(savedA),'Workflow lost after rename/refresh');
    for(const [type,content] of Object.entries(prompts)) assert(await map(`AC.${type}.PROMPT`).inputValue()===content,'Prompt lost '+type);
    assert(await page.locator('.vue-flow__edge').count()===3,'Edges lost after rename/refresh');

    const idB=await create('AC02C Project B');
    assert(idB&&idB!==idA,'Project B not created independently');
    await add('TEXT');
    await map('AC.TEXT.PROMPT').fill('AC02C B doc lap');
    const savedB=snap(await awaitSaved(idB,1,0));
    assert(savedB.nodes[0].id!==savedA.nodes[0].id,'A/B reused node ID');

    // Cancel project deletion via real UI controls; not even a DELETE request.
    const deleteCount=()=>requests.filter(s=>s.startsWith(`DELETE /api/projects/${idA} `)).length;
    await action(idA,'DELETE');
    const beforeCancel=deleteCount();
    await map('AC.HOME.PROJECT.DELETE.CANCEL').click();
    assert(deleteCount()===beforeCancel,'Cancel deletion sent DELETE');
    assert(await item(idA).count()===1,'Cancel deletion removed project');

    // Simulated API failure must not remove project from active list.
    await action(idA,'DELETE');
    await page.route(`**/api/projects/${idA}`,async route=>{
      if(route.request().method()==='DELETE') await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'AC02C test loi xoa mem'})});
      else await route.continue();
    });
    await map('AC.HOME.PROJECT.DELETE.CONFIRM').click();
    await page.waitForTimeout(250);
    assert(await item(idA).count()===1,'Failed DELETE removed project optimistically');
    await page.unroute(`**/api/projects/${idA}`);
    if(await map('AC.HOME.PROJECT.DELETE.DIALOG').isVisible()) await map('AC.HOME.PROJECT.DELETE.CANCEL').click();
    await action(idA,'DELETE');
    await map('AC.HOME.PROJECT.DELETE.CONFIRM').click();
    await item(idA).waitFor({state:'detached',timeout:12000});
    const activeList=await api('/api/projects');
    const trash=await api('/api/projects?status=deleted');
    assert(!activeList.body.projects.some(p=>p.id===idA),'Soft-deleted A still active');
    assert(activeList.body.projects.some(p=>p.id===idB),'Soft-delete A affected B');
    assert(trash.body.projects.some(p=>p.id===idA),'Soft-deleted A missing from trash');
    assert(JSON.stringify(snap(await getCanvas(idB)))===JSON.stringify(savedB),'Soft-delete A changed B');
    assert((await api(`/api/projects/${idA}/canvas`)).status===404,'Deleted A remains accessible via canvas GET');
    await map('AC.HOME.PROJECT.TRASH.TOGGLE').click();
    await map('AC.HOME.PROJECT.TRASH.LIST').waitFor({state:'visible'});
    const restore=page.locator(`[data-map-id="AC.HOME.PROJECT.RESTORE"][data-project-id="${idA}"]`);
    await restore.click();
    await item(idA).waitFor({state:'visible',timeout:12000});
    assert((await api('/api/projects?status=deleted')).body.projects.every(p=>p.id!==idA),'Restore did not clear deletedAt');
    assert(JSON.stringify(snap(await getCanvas(idA)))===JSON.stringify(savedA),'Soft delete/restore changed workflow IDs or revision');
    await openProjectCard(idA);
    await map('AC.VIDEO.PROMPT').waitFor({state:'visible'});
    assert((await page.locator('.topbarProjectName').innerText()).includes(rename),'Restored A lost renamed name');
    for(const [type,content] of Object.entries(prompts)) assert(await map(`AC.${type}.PROMPT`).inputValue()===content,'Restored prompt mismatch');
    assert(await page.locator('.vue-flow__edge').count()===3,'Restored edges missing');
    const postRestore=snap(await getCanvas(idA));
    assert(JSON.stringify(postRestore)===JSON.stringify(savedA),'UI reopen changed canvas revision or viewport');
    const requiredMapIds=['AC.HOME.PROJECT.MENU','AC.HOME.PROJECT.TRASH.TOGGLE','AC.HOME.OPEN',
      'AC.CANVAS','AC.CANVAS.CONNECT','AC.TEXT.NODE','AC.IMAGE.NODE','AC.VIDEO.NODE','AC.CANVAS.SAVE.STATUS'];
    await openLibrary();
    for(const id of requiredMapIds) assert(await map(id).count()>0,'Missing MapID '+id);
    await closeLibrary();
    assert(requests.some(s=>s.startsWith(`PATCH /api/projects/${idA} 200`)),'No successful PATCH in browser network');
    assert(requests.some(s=>s.startsWith(`DELETE /api/projects/${idA} 200`)),'No successful DELETE in network');
    assert(requests.some(s=>s.startsWith(`POST /api/projects/${idA}/restore 200`)),'No successful RESTORE in network');
    assert(runtimeErrors.length===0,'JS runtime errors: '+runtimeErrors.join(' | '));
    await page.evaluate(record=>sessionStorage.setItem('AC02C_ACCEPTANCE',JSON.stringify(record)),
      {idA,idB,rename,savedA,savedB});
    return {result:'PASS',idA,idB,rename,canvasId:savedA.id,revision:savedA.revision,
      nodes:savedA.nodes,edges:savedA.edges,viewport:savedA.viewport,
      cancelNoDelete:true,apiFailureOldNamePreserved:true,failedDeletePreserved:true,
      restorePreservesWorkflow:true,consoleRuntimeErrors:runtimeErrors.length,
      requestSummary:[...new Set(requests)].slice(-22),schemaVersion:health.body.schemaVersion};
  } finally {page.off('response',onResponse);page.off('pageerror',onPageError);}
}
