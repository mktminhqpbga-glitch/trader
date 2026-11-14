// Run after stopping/restarting only the AC-02A test backend on the isolated AC_PORT.
async (page) => {
  // This Playwright CLI browser script targets the isolated UI-01 test server (port 5184).
  const webUrl = 'http://127.0.0.1:5184/';
  const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
  const openProjectCard = async id => {
    if (await page.locator('[data-map-id="AC.CANVAS"]').count() &&
        !await page.locator('.canvasLibraryDrawer').count()) {
      await page.locator('[data-map-id="AC.UI.PANEL.TOGGLE"]').click();
      await page.locator('.canvasLibraryDrawer').waitFor({ state:'visible' });
    }
    await page.locator('[data-map-id="AC.HOME.OPEN"][data-project-id="' + id + '"]').click();
    await page.locator('[data-map-id="AC.CANVAS"]').waitFor({ state:'visible' });
    await page.locator('.canvasLibraryDrawer').waitFor({ state:'detached' });
  };
  await page.goto(webUrl);
  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('AC02_ACCEPTANCE') || 'null'));
  assert(stored && stored.a && stored.b, 'Thiếu dữ liệu đối chứng trước restart');
  const getCanvas = async id => page.evaluate(async projectId => {
    const res = await fetch('/api/projects/' + projectId + '/canvas');
    if (!res.ok) throw new Error('GET Canvas HTTP ' + res.status);
    return (await res.json()).canvas;
  }, id);
  const snap = c => ({
    id:c.id, revision:c.revision, viewport:c.viewport,
    nodes:c.nodes.map(n => ({id:n.id,type:n.type,content:n.data.content,position:n.position})),
    edges:c.edges,
  });
  assert(JSON.stringify(stored.snapA) === JSON.stringify(snap(await getCanvas(stored.a))),
    'Project A thay đổi sau restart');
  assert(JSON.stringify(stored.snapB) === JSON.stringify(snap(await getCanvas(stored.b))),
    'Project B thay đổi sau restart');
  await openProjectCard(stored.a);
  const prompt = page.locator('[data-map-id="AC.TEXT.PROMPT"]');
  await prompt.waitFor({state:'visible'});
  assert(await prompt.inputValue()==='Kiem thu du an A', 'Khôi phục Text sau restart lỗi');
  await page.route('**/api/projects/*/canvas', async route => {
    if (route.request().method()==='PUT') {
      await route.fulfill({status:503,contentType:'application/json',
        body:JSON.stringify({ok:false,message:'AC-02A mô phỏng lỗi lưu SQLite'})});
    } else await route.continue();
  });
  const changed = 'Kiem thu du an A - luu lai thanh cong';
  await prompt.fill(changed);
  await page.locator('[data-map-id="AC.CANVAS.SAVE.ERROR"]').waitFor({state:'visible',timeout:15000});
  assert(await prompt.inputValue()===changed, 'Lỗi PUT khiến bản nháp mất');
  const rejected = await getCanvas(stored.a);
  assert(rejected.nodes[0].data.content==='Kiem thu du an A', 'Lỗi giả lập vẫn ghi SQLite');
  await page.unroute('**/api/projects/*/canvas');
  await page.locator('[data-map-id="AC.CANVAS.SAVE.RETRY"]').click();
  let retryOk = false;
  for (let tries=0;tries<60;tries++) {
    const restored = await getCanvas(stored.a);
    const cls = await page.locator('[data-map-id="AC.CANVAS.SAVE.STATUS"]').getAttribute('class');
    if (restored.nodes[0].data.content===changed && cls?.includes('saved')) {
      retryOk = true; break;
    }
    await page.waitForTimeout(200);
  }
  assert(retryOk, 'Thử lưu lại không thành công');
  await page.reload();
  await openProjectCard(stored.a);
  await prompt.waitFor({state:'visible'});
  assert(await prompt.inputValue()===changed, 'Refresh sau retry không phục hồi');
  const health = await page.evaluate(async() => {
    const r=await fetch('/api/health');
    return {status:r.status, body:await r.json()};
  });
  assert(health.status===200 && health.body.database==='connected', 'Health AC-01 bị hỏng');
  return {result:'PASS',projectA:stored.a,projectB:stored.b,
    afterRestart:true,failureVisible:true,draftPreserved:true,retrySaved:true,
    restoredAfterRefresh:true,health:health.body};
}
