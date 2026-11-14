// AC-02A Playwright CLI test. Start isolated dev on localhost:5182/3112.
async (page) => {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const map = (id) => page.locator('[data-map-id="' + id + '"]');
  const getCanvas = async (id) => page.evaluate(async (projectId) => {
    const res = await fetch('/api/projects/' + encodeURIComponent(projectId) + '/canvas');
    if (!res.ok) throw new Error('GET Canvas HTTP ' + res.status);
    return (await res.json()).canvas;
  }, id);
  const snap = (c) => ({
    id: c.id, revision:c.revision, viewport:c.viewport,
    nodes: c.nodes.map(n => ({ id:n.id, type:n.type, content:n.data.content, position:n.position })),
    edges:c.edges,
  });
  const create = async (name) => {
    const previousId = await page.locator('.projectItem.active').getAttribute('data-project-id').catch(() => null);
    await page.locator('.sidebar [data-map-id="AC.HOME.NEW"]').last().click();
    await map('AC.HOME.NEW.NAME').fill(name);
    await map('AC.HOME.NEW.CREATE').click();
    await map('AC.CANVAS').waitFor({ state:'visible' });
    await page.waitForFunction(previous => {
      const current = document.querySelector('.projectItem.active')?.getAttribute('data-project-id');
      return current && current !== previous;
    }, previousId, { timeout:12000 });
    return page.locator('.projectItem.active').getAttribute('data-project-id');
  };
  const addText = async () => {
    await map('AC.CANVAS.ADD.NODE').click();
    await map('AC.CANVAS.ADD.NODE.TEXT').click();
    await map('AC.TEXT.NODE').waitFor({ state:'visible' });
  };
  const awaitSaved = async (id, content) => {
    for (let attempt=0; attempt<55; attempt++) {
      const canvas = await getCanvas(id);
      const state = await map('AC.CANVAS.SAVE.STATUS').getAttribute('class');
      if (canvas.revision>0 && canvas.nodes.length===1 &&
          canvas.nodes[0].data.content===content && state?.includes('saved')) return canvas;
      await page.waitForTimeout(300);
    }
    throw new Error('Không nhận được SQLite ACK cho ' + id);
  };
  await page.setViewportSize({ width: 1520, height: 920 });
  await page.goto('http://127.0.0.1:5182/');
  await map('AC.SYSTEM.HEALTH.RETRY').waitFor();
  for (const id of ['AC.HOME.NEW','AC.HOME.PROJECTS','AC.SYSTEM.HEALTH']) {
    assert(await map(id).count() > 0, 'Thiếu MapID ' + id);
  }
  const suffix = Date.now().toString(36);
  const idA = await create('AC02A Project A ' + suffix);
  assert(idA, 'Không tạo được Project A');
  const newCanvas = await getCanvas(idA);
  const ensure = await page.evaluate(async (id) => {
    const r = await fetch('/api/projects/' + id + '/canvas', { method:'POST' });
    return { status:r.status, body:await r.json() };
  }, idA);
  assert(ensure.status === 200 && ensure.body.created === false && ensure.body.canvas.id === newCanvas.id,
    'POST Canvas không idempotent');
  await addText();
  assert(await map('AC.TEXT.NODE').count()===1, 'Text Node không được tạo');
  assert(await map('AC.IMAGE.NODE').count()===0 && await map('AC.VIDEO.NODE').count()===0,
    'Có node ngoài phạm vi AC-02A');
  await map('AC.TEXT.PROMPT').fill('Kiem thu du an A');
  const beforeDrag = await map('AC.TEXT.NODE').boundingBox();
  const head = await map('AC.TEXT.NODE').locator('.node-drag-handle').boundingBox();
  assert(beforeDrag && head, 'Không đọc được node bounding box');
  await page.mouse.move(head.x+head.width/2, head.y+head.height/2);
  await page.mouse.down();
  await page.mouse.move(head.x+head.width/2+92, head.y+head.height/2+70, { steps:16 });
  await page.mouse.up();
  const afterDrag = await map('AC.TEXT.NODE').boundingBox();
  assert(afterDrag && Math.abs(afterDrag.x-beforeDrag.x)>40 && Math.abs(afterDrag.y-beforeDrag.y)>30,
    'Kéo Text Node không đổi vị trí');
  const toolbarBefore = await map('AC.CANVAS.TOOLBAR').boundingBox();
  const transformation = page.locator('.vue-flow__transformationpane');
  const beforeZoom = await transformation.getAttribute('style');
  await map('AC.CANVAS.ZOOM.IN').click();
  await page.waitForTimeout(300);
  assert((await transformation.getAttribute('style'))!==beforeZoom, 'Zoom In không hoạt động');
  const toolbarAfter = await map('AC.CANVAS.TOOLBAR').boundingBox();
  assert(toolbarBefore && toolbarAfter &&
    Math.abs(toolbarBefore.width-toolbarAfter.width)<1 &&
    Math.abs(toolbarBefore.height-toolbarAfter.height)<1, 'Toolbar thay kích thước');
  await map('AC.CANVAS.ZOOM.OUT').click();
  await map('AC.CANVAS.FIT').click();
  await page.waitForTimeout(300);
  const beforePan = await transformation.getAttribute('style');
  const pane = await page.locator('.vue-flow__pane').boundingBox();
  assert(pane, 'Không có Canvas pane');
  await page.mouse.move(pane.x+45, pane.y+pane.height-80);
  await page.mouse.down();
  await page.mouse.move(pane.x+125, pane.y+pane.height-33, { steps:14 });
  await page.mouse.up();
  assert((await transformation.getAttribute('style'))!==beforePan, 'Không pan được Canvas');
  const savedA = snap(await awaitSaved(idA, 'Kiem thu du an A'));
  assert(savedA.revision>0 && savedA.nodes.length===1 && savedA.nodes[0].type==='text',
    'Lưu SQLite không đúng: '+JSON.stringify(savedA));
  assert(savedA.nodes[0].position.x !== 0, 'SQLite không lưu tọa độ');
  assert(savedA.viewport.x !== newCanvas.viewport.x || savedA.viewport.zoom !== newCanvas.viewport.zoom,
    'SQLite không lưu viewport');
  const visualBefore = await transformation.getAttribute('style');
  await page.reload();
  await page.locator('[data-map-id="AC.HOME.OPEN"][data-project-id="'+idA+'"]').click();
  await map('AC.TEXT.PROMPT').waitFor({ state:'visible' });
  await page.waitForTimeout(250);
  assert(await map('AC.TEXT.PROMPT').inputValue()==='Kiem thu du an A', 'Text không phục hồi');
  assert(JSON.stringify(savedA)===JSON.stringify(snap(await getCanvas(idA))),
    'ID/nội dung/vị trí/viewport khác sau refresh');
  assert(visualBefore===await transformation.getAttribute('style'), 'Viewport giao diện không phục hồi');
  const idB = await create('AC02A Project B ' + suffix);
  assert(idB && idB!==idA, 'Không tạo được B');
  await addText();
  await map('AC.TEXT.PROMPT').fill('Kiem thu du an B');
  const savedB = snap(await awaitSaved(idB, 'Kiem thu du an B'));
  assert(savedB.nodes[0].id !== savedA.nodes[0].id, 'Node IDs bị trùng');
  await page.locator('[data-map-id="AC.HOME.OPEN"][data-project-id="'+idA+'"]').click();
  await map('AC.TEXT.PROMPT').waitFor({ state:'visible' });
  assert(await map('AC.TEXT.PROMPT').inputValue()==='Kiem thu du an A', 'A/B bị trộn');
  assert(JSON.stringify(savedA)===JSON.stringify(snap(await getCanvas(idA))), 'A thay đổi khi tạo B');
  const projects = await page.evaluate(async()=> (await (await fetch('/api/projects')).json()).projects);
  assert(projects.some(p=>p.id===idA) && projects.some(p=>p.id===idB), 'Project list sai');
  await page.evaluate(({a,b,snapA,snapB}) =>
    sessionStorage.setItem('AC02_ACCEPTANCE',JSON.stringify({a,b,snapA,snapB})),
    {a:idA,b:idB,snapA:savedA,snapB:savedB});
  return {result:'PASS',idA,idB,canvasId:savedA.id,nodeId:savedA.nodes[0].id,
    prompt:savedA.nodes[0].content,position:savedA.nodes[0].position,
    viewport:savedA.viewport,revision:savedA.revision,
    checked:'create/list/open/POST canvas/Text/drag/pan/zoom/fit/autosave/refresh/isolation'};
}
