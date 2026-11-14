// Extra real mouse regression: connected wire stays attached when moving a node;
// typing/scrolling inside a textarea must not pan or zoom the Canvas.
async (page) => {
  // This Playwright CLI browser script targets the isolated UI-01 test server (port 5184).
  const webUrl = 'http://127.0.0.1:5184/';
  const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
  const map = id => page.locator(`[data-map-id="${id}"]`);
  const openProjectCard = async id => {
    if (await map('AC.CANVAS').count() && !await page.locator('.canvasLibraryDrawer').count()) {
      await map('AC.UI.PANEL.TOGGLE').click();
      await page.locator('.canvasLibraryDrawer').waitFor({state:'visible'});
    }
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();
    await map('AC.CANVAS').waitFor({state:'visible'});
    await page.locator('.canvasLibraryDrawer').waitFor({state:'detached'});
  };
  const ref = await page.evaluate(() => JSON.parse(sessionStorage.getItem('AC02B_ACCEPTANCE') || 'null'));
  assert(ref?.id, 'Missing AC02B_ACCEPTANCE from browser flow');
  const getCanvas = async () => page.evaluate(async id =>
    (await (await fetch(`/api/projects/${id}/canvas`)).json()).canvas, ref.id);
  await page.goto(webUrl);
  await openProjectCard(ref.id);
  await map('AC.TEXT.NODE').waitFor({state:'visible'});
  assert(await map('AC.IMAGE.NODE').count() === 0 && await map('AC.VIDEO.NODE').count() === 1,
    'Expected post-deletion 2-node canvas');
  assert((await map('AC.VIDEO.RESULT').innerText()).includes('Chưa kết nối AI'), 'Video chưa báo trạng thái AI');
  const text = map('AC.TEXT.NODE');
  const prompt = map('AC.TEXT.PROMPT');
  const edge = page.locator('.vue-flow__edge');
  assert(await edge.count() === 1, 'Expected Text→Video edge');
  const edgeId = await edge.getAttribute('data-id');
  const path = edge.locator('path').first();
  const pathBefore = await path.getAttribute('d');
  const viewport = page.locator('.vue-flow__transformationpane');
  const transform = await viewport.getAttribute('style');
  const snapshotBefore = await getCanvas();
  await prompt.hover(); await page.mouse.wheel(0, 420); await page.waitForTimeout(220);
  assert(await viewport.getAttribute('style') === transform, 'Scrolling textarea zoomed/panned canvas');
  const inputRect = await prompt.boundingBox();
  const nodeRect = await text.boundingBox();
  assert(inputRect && nodeRect, 'Missing prompt/node bounding box');
  await page.mouse.move(inputRect.x + 42, inputRect.y + 28); await page.mouse.down();
  await page.mouse.move(inputRect.x + 80, inputRect.y + 45, {steps:10}); await page.mouse.up();
  const afterPromptDrag = await text.boundingBox();
  assert(afterPromptDrag && Math.abs(afterPromptDrag.x - nodeRect.x) < 1 &&
    Math.abs(afterPromptDrag.y - nodeRect.y) < 1, 'Dragging in textarea moved node');
  const header = await text.locator('.node-drag-handle').boundingBox();
  assert(header, 'No drag header');
  const x = header.x + header.width * .43, y = header.y + header.height * .5;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 85, y - 32, {steps:20}); await page.mouse.up();
  await page.waitForTimeout(250);
  assert(await edge.count() === 1 && await edge.getAttribute('data-id') === edgeId, 'Moving connected node removed/replaced edge');
  assert(await path.getAttribute('d') !== pathBefore, 'SVG edge path did not update with node drag');
  let saved;
  for (let i = 0; i < 50; i++) {
    saved = await getCanvas();
    const status = await map('AC.CANVAS.SAVE.STATUS').getAttribute('class');
    if (saved.revision > snapshotBefore.revision && status?.includes('saved')) break;
    await page.waitForTimeout(220);
  }
  assert(saved.revision > snapshotBefore.revision, 'Connected node position not autosaved');
  assert(saved.edges.length === 1 && saved.edges[0].id === edgeId, 'SQLite changed connected edge ID');
  assert(saved.nodes.find(n=>n.type==='text').position.x !== snapshotBefore.nodes.find(n=>n.type==='text').position.x,
    'SQLite Text position did not move');
  await page.reload();
  await openProjectCard(ref.id);
  await map('AC.TEXT.NODE').waitFor({state:'visible'});
  assert(await page.locator('.vue-flow__edge').count() === 1, 'Connected edge missing after refresh');
  const restored = await getCanvas();
  assert(JSON.stringify(restored.nodes.map(n=>({id:n.id,position:n.position}))) ===
    JSON.stringify(saved.nodes.map(n=>({id:n.id,position:n.position}))), 'Connected node positions not restored');
  return {result:'PASS',projectId:ref.id,revisionBefore:snapshotBefore.revision,revisionAfter:saved.revision,
    edgeId,promptWheelNoZoom:true,promptMouseNoDrag:true,edgePathMovesWithNode:true,refreshRetainsEdge:true};
}
