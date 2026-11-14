// AC-02C restart test: stop ONLY isolated dev, restart with SAME AC_DB_PATH,
// then npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02c-browser-restart.js
async (page) => {
  // This Playwright CLI browser script targets the isolated UI-01 test server (port 5184).
  const webUrl = 'http://127.0.0.1:5184/';
  const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
  const openProjectCard = async id => {
    if (await page.locator('[data-map-id="AC.CANVAS"]').count() &&
        !await page.locator('.canvasLibraryDrawer').count()) {
      await page.locator('[data-map-id="AC.UI.PANEL.TOGGLE"]').click();
      await page.locator('.canvasLibraryDrawer').waitFor({state:'visible'});
    }
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();
    await page.locator('[data-map-id="AC.CANVAS"]').waitFor({state:'visible'});
    await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
  };
  await page.goto(webUrl);
  const state=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('AC02C_ACCEPTANCE')||'null'));
  assert(state?.idA&&state.idB,'Missing AC02C baseline before restart');
  const api=async path=>page.evaluate(async path=>{
    const r=await fetch(path);return{status:r.status,body:await r.json()};
  },path);
  const snap=c=>({id:c.id,revision:c.revision,viewport:c.viewport,
    nodes:c.nodes.map(n=>({id:n.id,type:n.type,content:n.data.content,position:n.position})),
    edges:c.edges.map(e=>({id:e.id,source:e.source,target:e.target,
      sourceHandle:e.sourceHandle,targetHandle:e.targetHandle}))});
  const health=await api('/api/health');
  assert(health.status===200&&health.body.schemaVersion===4,'Schema v4 not restored after restart');
  const [resultA,resultB]=await Promise.all([api(`/api/projects/${state.idA}`),api(`/api/projects/${state.idB}`)]);
  assert(resultA.status===200&&resultB.status===200,'Project A/B missing after restart');
  assert(resultA.body.project.name===state.rename,'Project A rename not persisted after restart');
  assert(JSON.stringify(snap(resultA.body.canvas))===JSON.stringify(state.savedA),'A workflow changed after restart');
  assert(JSON.stringify(snap(resultB.body.canvas))===JSON.stringify(state.savedB),'B project changed after restart');
  assert(!(await api('/api/projects?status=deleted')).body.projects.some(p=>p.id===state.idA),'Restored A fell back into trash');
  await openProjectCard(state.idA);
  for(const type of ['TEXT','IMAGE','VIDEO'])
    assert(await page.locator(`[data-map-id="AC.${type}.NODE"]`).count()===1,`Node ${type} not restored`);
  assert(await page.locator('.vue-flow__edge').count()===3,'Three workflow edges not restored on UI after restart');
  assert((await page.locator('[data-map-id="AC.CANVAS.SAVE.STATUS"]').innerText()).includes('Đã'),
    'No save ACK status after restart');
  await openProjectCard(state.idB);
  assert(await page.locator('[data-map-id="AC.TEXT.NODE"]').count()===1 &&
    await page.locator('[data-map-id="AC.IMAGE.NODE"]').count()===0,'B got contaminated after restart');
  return {result:'PASS',idA:state.idA,idB:state.idB,nameA:state.rename,
    canvasIdA:state.savedA.id,revisionA:state.savedA.revision,
    nodesA:resultA.body.canvas.nodes.length,edgesA:resultA.body.canvas.edges.length,
    projectBIsolated:true,health:health.body};
}
