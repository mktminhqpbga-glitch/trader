// AC-02 audit: a real UI draft must never overwrite a newer server revision.
// Run after AC02C main flow, on isolated dev server. No direct DOM mutations.
async (page) => {
  // This Playwright CLI browser script targets the isolated UI-01 test server (port 5184).
  const webUrl = 'http://127.0.0.1:5184/';
  const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
  const map=id=>page.locator(`[data-map-id="${id}"]`);
  const openLibrary = async () => {
    if (await map('AC.CANVAS').count() && !await page.locator('.canvasLibraryDrawer').count()) {
      await map('AC.UI.PANEL.TOGGLE').click();
      await page.locator('.canvasLibraryDrawer').waitFor({state:'visible'});
    }
  };
  const openProjectCard = async id => {
    await openLibrary();
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();
    await map('AC.CANVAS').waitFor({state:'visible'});
    await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
  };
  const api=async (path,method='GET',body)=>page.evaluate(async({path,method,body})=>{
    const r=await fetch(path,{method,...(body===undefined?{}:{headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
    return{status:r.status,body:await r.json()};
  },{path,method,body});
  await page.goto(webUrl);
  await page.locator('.sidebar [data-map-id="AC.HOME.NEW"]').last().click();
  await map('AC.HOME.NEW.NAME').fill('AC02C Conflict Audit');
  await map('AC.HOME.NEW.CREATE').click();
  await map('AC.CANVAS').waitFor({state:'visible'});
  await page.waitForFunction(() => document.querySelector('.topbarProjectName')?.textContent?.includes('AC02C Conflict Audit'),
    null, {timeout:12000});
  await openLibrary();
  const id=await page.locator('.projectItem.active').getAttribute('data-project-id');
  await map('AC.UI.PANEL.TOGGLE').click();
  await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
  assert(id,'No conflict audit project');
  await map('AC.CANVAS.ADD.NODE').click();
  await map('AC.CANVAS.ADD.NODE.TEXT').click();
  const prompt=map('AC.TEXT.PROMPT');
  await prompt.fill('Ban dau da luu');
  let start;
  for(let i=0;i<60;i++) {
    const r=await api(`/api/projects/${id}/canvas`);
    if(r.status===200&&r.body.canvas.nodes[0]?.data.content==='Ban dau da luu'&&
      (await map('AC.CANVAS.SAVE.STATUS').getAttribute('class'))?.includes('saved')) {start=r.body.canvas;break;}
    await page.waitForTimeout(220);
  }
  assert(start,'Initial project not autosaved');
  const remotePrompt='Ban cap nhat tren server';
  const external=await api(`/api/projects/${id}/canvas`,'PUT',{
    revision:start.revision,
    nodes:start.nodes.map(n=>({...n,data:{...n.data,content:remotePrompt}})),
    edges:start.edges,viewport:start.viewport,
  });
  assert(external.status===200&&external.body.canvas.revision===start.revision+1,'External concurrency update failed');
  const localPrompt='Ban nhap chua luu khong duoc mat';
  await prompt.fill(localPrompt);
  await map('AC.CANVAS.SAVE.CONFLICT').waitFor({state:'visible',timeout:16000});
  assert(await prompt.inputValue()===localPrompt,'409 discarded local unsaved draft');
  let server=await api(`/api/projects/${id}/canvas`);
  assert(server.body.canvas.revision===start.revision+1&&server.body.canvas.nodes[0].data.content===remotePrompt,
    '409 overwrote newer server revision');
  // Explicit reload is safe ONLY after user confirmation; cancel preserves draft.
  await map('AC.CANVAS.SAVE.RELOAD').click();
  await page.getByRole('button',{name:'Hủy',exact:true}).last().click();
  assert(await prompt.inputValue()===localPrompt,'Cancel reload lost unsaved draft');
  await map('AC.CANVAS.SAVE.RELOAD').click();
  await page.getByRole('button',{name:'Nạp lại',exact:true}).last().click();
  await page.waitForTimeout(320);
  assert(await prompt.inputValue()===remotePrompt,'Confirmed reload did not load latest server revision');
  server=await api(`/api/projects/${id}/canvas`);
  assert(server.body.canvas.revision===start.revision+1,'Reload changed server revision unexpectedly');
  await page.reload();
  await openProjectCard(id);
  assert(await prompt.inputValue()===remotePrompt,'Refresh did not preserve conflict resolution');
  return {result:'PASS',projectId:id,oldRevision:start.revision,newRevision:server.body.canvas.revision,
    conflict409Visible:true,localDraftPreserved:true,cancelReloadSafe:true,reloadExplicit:true,afterRefresh:true};
}
