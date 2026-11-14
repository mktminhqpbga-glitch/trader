// AC-02C extra UI audit: cancel rename, trash load failure/retry,
// deleting the currently open project only after server ACK, then restoring it.
async (page) => {
  // This Playwright CLI browser script targets the isolated UI-01 test server (port 5184).
  const webUrl = 'http://127.0.0.1:5184/';
  const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
  const map=id=>page.locator(`[data-map-id="${id}"]`);
  const item=id=>page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`);
  const openLibrary=async()=>{
    if(await map('AC.CANVAS').count() && !await page.locator('.canvasLibraryDrawer').count()){
      await map('AC.UI.PANEL.TOGGLE').click();
      await page.locator('.canvasLibraryDrawer').waitFor({state:'visible'});
    }
  };
  const openProjectCard=async id=>{
    await openLibrary();
    await item(id).click();
    await map('AC.CANVAS').waitFor({state:'visible'});
    await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
  };
  const menu=async(id,action)=>{
    await openLibrary();
    await page.locator(`[data-map-id="AC.HOME.PROJECT.MENU"][data-project-id="${id}"]`).click();
    await page.locator(`[data-map-id="AC.HOME.PROJECT.${action}"][data-project-id="${id}"]`).click();
  };
  const api=async path=>page.evaluate(async path=>{
    const response=await fetch(path);return{status:response.status,body:await response.json()};
  },path);
  const requests=[];
  const onRequest=req=>{if(req.url().includes('/api/projects/'))requests.push(`${req.method()} ${new URL(req.url()).pathname}`);};
  page.on('request',onRequest);
  try {
    await page.goto(webUrl);
    const data=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('AC02C_ACCEPTANCE')||'null'));
    assert(data?.idA && data.idB,'Missing AC02C baseline');
    const renamed=data.rename;
    await openProjectCard(data.idA);
    await menu(data.idA,'RENAME');
    const beforeCancel=requests.filter(r=>r.startsWith(`PATCH /api/projects/${data.idA}`)).length;
    await map('AC.HOME.PROJECT.RENAME.NAME').fill('Khong duoc luu do huy');
    await map('AC.HOME.PROJECT.RENAME.CANCEL').click();
    assert(requests.filter(r=>r.startsWith(`PATCH /api/projects/${data.idA}`)).length===beforeCancel,
      'Cancel rename unexpectedly sent PATCH');
    assert((await item(data.idA).innerText()).includes(renamed),'Cancel rename changed project name');
    await menu(data.idA,'RENAME');
    await map('AC.HOME.PROJECT.RENAME.NAME').fill('   ');
    await map('AC.HOME.PROJECT.RENAME.CONFIRM').click();
    assert(await map('AC.HOME.PROJECT.RENAME.DIALOG').isVisible(),'Invalid empty name closed rename dialog');
    assert(requests.filter(r=>r.startsWith(`PATCH /api/projects/${data.idA}`)).length===beforeCancel,
      'Invalid name unexpectedly sent PATCH');
    await map('AC.HOME.PROJECT.RENAME.CANCEL').click();

    // Simulate server 503 only for trash list; a real Retry click must recover.
    await page.route('**/api/projects?status=deleted',route=>route.fulfill({
      status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'AC02C loi tai thung rac'})}));
    await map('AC.HOME.PROJECT.TRASH.TOGGLE').click();
    await map('AC.HOME.PROJECT.TRASH.RETRY').waitFor({state:'visible',timeout:9000});
    await page.unroute('**/api/projects?status=deleted');
    await map('AC.HOME.PROJECT.TRASH.RETRY').click();
    await map('AC.HOME.PROJECT.TRASH.RETRY').waitFor({state:'detached',timeout:10000});
    assert(await map('AC.HOME.PROJECT.TRASH.LIST').isVisible(),'Trash list did not recover after retry');

    // Test deletion of the ACTIVE project, including actual navigation and restoration.
    const projectBefore=await api(`/api/projects/${data.idA}`);
    assert(projectBefore.status===200,'Project A not active');
    await menu(data.idA,'DELETE');
    const beforeDelete=requests.filter(r=>r.startsWith(`DELETE /api/projects/${data.idA}`)).length;
    await map('AC.HOME.PROJECT.DELETE.CANCEL').click();
    assert(requests.filter(r=>r.startsWith(`DELETE /api/projects/${data.idA}`)).length===beforeDelete,
      'Cancelled active delete sent DELETE');
    assert(await map('AC.CANVAS').isVisible(),'Canceled active deletion closed canvas');
    await menu(data.idA,'DELETE');
    await map('AC.HOME.PROJECT.DELETE.CONFIRM').click();
    await item(data.idA).waitFor({state:'detached',timeout:12000});
    assert(await map('AC.HOME').isVisible(),'Successful active delete did not navigate home');
    assert(await page.locator('.canvasLibraryDrawer').count()===0,'Active project deletion left library drawer open');
    assert(await item(data.idB).count()===1,'Active A deletion changed project B');
    if(!(await map('AC.HOME.PROJECT.TRASH.LIST').isVisible())) await map('AC.HOME.PROJECT.TRASH.TOGGLE').click();
    await page.locator(`[data-map-id="AC.HOME.PROJECT.RESTORE"][data-project-id="${data.idA}"]`).click();
    await item(data.idA).waitFor({state:'visible',timeout:12000});
    const projectAfter=await api(`/api/projects/${data.idA}`);
    assert(projectAfter.status===200&&projectAfter.body.project.name===renamed,'Active deletion restore lost name');
    assert(JSON.stringify(projectAfter.body.canvas)===JSON.stringify(projectBefore.body.canvas),
      'Active deletion/restore changed Canvas or workflow');
    return {result:'PASS',idA:data.idA,renameCancelNoRequest:true,invalidNameNoRequest:true,
      trashErrorAndRetry:true,activeDeleteCancelled:true,activeDeleteNavigation:true,
      activeRestorePreservesCanvas:true,revision:projectAfter.body.canvas.revision};
  } finally {page.off('request',onRequest);}
}
