// Run after stopping and restarting isolated AC-02B dev on the SAME test database.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const map = id => page.locator(`[data-map-id="${id}"]`);
  await page.goto('http://127.0.0.1:5182/');
  const baseline = await page.evaluate(() => JSON.parse(sessionStorage.getItem('AC02B_ACCEPTANCE') || 'null'));
  assert(baseline?.id && baseline.before, 'Không có dữ liệu đối chứng trước restart');
  const getCanvas = async () => page.evaluate(async id => {
    const response = await fetch(`/api/projects/${id}/canvas`);
    if (!response.ok) throw new Error('GET canvas after restart HTTP ' + response.status);
    return (await response.json()).canvas;
  }, baseline.id);
  const snapshot = c => ({ id:c.id, revision:c.revision, viewport:c.viewport,
    nodes:c.nodes.map(n => ({ id:n.id, type:n.type, content:n.data.content, position:n.position })),
    edges:c.edges.map(e => ({id:e.id,source:e.source,target:e.target,
      sourceHandle:e.sourceHandle,targetHandle:e.targetHandle})) });
  assert(JSON.stringify(snapshot(await getCanvas())) === JSON.stringify(baseline.before),
    'Dữ liệu SQLite thay đổi sau restart');
  await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${baseline.id}"]`).click();
  await map('AC.IMAGE.NODE').waitFor({ state:'visible' });
  assert(await page.locator('.vue-flow__edge').count() === 2, 'Không phục hồi đủ hai dây');
  const beforeNodes = new Map(baseline.before.nodes.map(n => [n.type, n]));
  for (const [type, node] of beforeNodes) {
    assert(await map(`AC.${type.toUpperCase()}.NODE`).getAttribute('data-node-id') === node.id, 'Sai nodeId sau restart: ' + type);
    assert(await map(`AC.${type.toUpperCase()}.PROMPT`).inputValue() === node.content, 'Sai prompt sau restart: ' + type);
  }
  // A real UI deletion and Element Plus confirmation must cascade SQLite edges.
  await map('AC.IMAGE.NODE').locator('[data-map-id="AC.CANVAS.NODE.DELETE"]').click();
  await page.getByRole('button', {name:'Xóa',exact:true}).last().click();
  await map('AC.IMAGE.NODE').waitFor({ state: 'detached' });
  assert(await page.locator('.vue-flow__edge').count() === 1,
    'Xóa Image phải gỡ Text→Image nhưng giữ nguyên Text→Video');
  let final;
  for (let i = 0; i < 65; i++) {
    final = await getCanvas();
    const state = await map('AC.CANVAS.SAVE.STATUS').getAttribute('class');
    if (final.nodes.length === 2 && final.edges.length === 1 && state?.includes('saved')) break;
    await page.waitForTimeout(220);
  }
  assert(final.nodes.length === 2 && final.edges.length === 1, 'SQLite xóa Image hoặc dây không đúng');
  assert(new Set(final.nodes.map(n => n.type)).size === 2 &&
    final.nodes.some(n => n.type === 'text') && final.nodes.some(n => n.type === 'video'), 'Xóa Image làm mất Text/Video');
  assert(final.revision > baseline.before.revision, 'Xóa node không tăng revision');
  const text = beforeNodes.get('text'), video = beforeNodes.get('video');
  assert(final.edges[0].id === baseline.before.edges.find(e => e.source === text.id && e.target === video.id)?.id &&
    final.edges[0].source === text.id && final.edges[0].target === video.id,
    'Edge Text→Video cần được giữ đúng ID khi xóa Image');
  const remainingNodeIds = new Set(final.nodes.map(n=>n.id));
  assert(final.nodes.every(n => beforeNodes.get(n.type)?.id === n.id &&
    beforeNodes.get(n.type)?.content === n.data.content &&
    JSON.stringify(beforeNodes.get(n.type)?.position) === JSON.stringify(n.position)),
    'Node còn lại bị thay');
  await page.reload();
  await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${baseline.id}"]`).click();
  await map('AC.TEXT.NODE').waitFor({state:'visible'});
  assert(await map('AC.IMAGE.NODE').count() === 0 && await map('AC.VIDEO.NODE').count() === 1, 'Refresh khôi phục node đã xóa');
  assert(await page.locator('.vue-flow__edge').count() === 1, 'Refresh làm mất dây Text→Video');
  assert((await getCanvas()).nodes.every(n => remainingNodeIds.has(n.id)), 'Node sau refresh thay ID');
  const health = await page.evaluate(async() => (await (await fetch('/api/health')).json()));
  assert(health.ok === true && health.database === 'connected', 'AC-01 health sau restart lỗi');
  return {result:'PASS',projectId:baseline.id,afterRestart:true,beforeRevision:baseline.before.revision,
    afterRevision:final.revision,remainingNodes:final.nodes.map(n=>({id:n.id,type:n.type,content:n.data.content})),
    remainingEdges:final.edges.length,refreshRetainsDeletion:true,health};
}
