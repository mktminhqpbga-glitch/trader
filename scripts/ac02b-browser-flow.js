// AC-02B actual Playwright CLI interaction test against isolated SQLite.
// Run via: npx --yes playwright@1.65.1 cli -s=ac02b run-code --filename scripts/ac02b-browser-flow.js
// Requires AC_PORT=3112 AC_WEB_PORT=5182 and a unique AC_DB_PATH.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const map = (id) => page.locator(`[data-map-id="${id}"]`);
  const api = async (path, method = 'GET', body) => page.evaluate(async ({path, method, body}) => {
    const response = await fetch(path, { method, ...(body === undefined ? {} : {
      headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    }) });
    return { status: response.status, body: await response.json() };
  }, { path, method, body });
  const canvas = async (id) => {
    const result = await api(`/api/projects/${id}/canvas`);
    assert(result.status === 200, 'GET Canvas thất bại: ' + result.status);
    return result.body.canvas;
  };
  const snapshot = (c) => ({ id: c.id, revision: c.revision, viewport: c.viewport,
    nodes: c.nodes.map(n => ({ id: n.id, type: n.type, content: n.data.content, position: n.position })),
    edges: c.edges.map(e => ({ id: e.id, source: e.source, target: e.target,
      sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })) });
  const getSaved = async (projectId, nodeCount, edgeCount) => {
    for (let i = 0; i < 65; i++) {
      const c = await canvas(projectId);
      const state = await map('AC.CANVAS.SAVE.STATUS').getAttribute('class');
      if (c.nodes.length === nodeCount && c.edges.length === edgeCount && state?.includes('saved'))
        return c;
      await page.waitForTimeout(220);
    }
    throw new Error(`Autosave không đạt ${nodeCount} node, ${edgeCount} edge`);
  };
  const connect = async (from, to) => {
    const source = await map(from).boundingBox();
    const target = await map(to).boundingBox();
    assert(source && target, `Không thấy cổng ${from} / ${to}`);
    const start = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
    const end = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move((start.x + end.x) / 2, (start.y + end.y) / 2, { steps: 18 });
    await page.mouse.move(end.x, end.y, { steps: 22 });
    await page.mouse.up();
    await page.waitForTimeout(320);
  };
  const positions = {};
  const moveNode = async (type, deltaX, deltaY) => {
    const node = map(`AC.${type}.NODE`);
    const header = await node.locator('.node-drag-handle').boundingBox();
    assert(header, 'Không thấy vùng kéo node ' + type);
    const x = header.x + header.width * .45, y = header.y + header.height * .55;
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + deltaX, y + deltaY, { steps: 18 }); await page.mouse.up();
    positions[type] = await node.boundingBox();
  };
  const browserProblems = [];
  const network = [];
  // Expected HTTP 400 rejected PUTs produce Chromium resource-error messages.
  // These are negative-test evidence, not JavaScript runtime faults.
  const onError = m => {
    if (m.type() === 'error' && !/Failed to load resource.*400|400 \(Bad Request\)/.test(m.text()))
      browserProblems.push('console: ' + m.text());
  };
  const onPageError = error => browserProblems.push('pageerror: ' + error.message);
  const onResponse = response => { if (response.url().includes('/api/'))
    network.push(`${response.request().method()} ${new URL(response.url()).pathname}: ${response.status()}`); };
  page.on('console', onError); page.on('pageerror', onPageError); page.on('response', onResponse);

  try {
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.goto('http://127.0.0.1:5182/');
    await map('AC.SYSTEM.HEALTH').waitFor({ state: 'visible' });
    await map('AC.HOME.NEW').first().click();
    await map('AC.HOME.NEW.NAME').fill('AC02B Test');
    await map('AC.HOME.NEW.CREATE').click();
    await map('AC.CANVAS').waitFor({ state: 'visible' });
    const projectId = await page.locator('.projectItem.active').getAttribute('data-project-id');
    assert(projectId, 'Không tìm thấy project id');
    const emptyCanvas = await canvas(projectId);

    for (const type of ['TEXT', 'IMAGE', 'VIDEO']) {
      await map('AC.CANVAS.ADD.NODE').click();
      await map(`AC.CANVAS.ADD.NODE.${type}`).click();
      await map(`AC.${type}.NODE`).waitFor({ state: 'visible' });
      assert(await map(`AC.${type}.NODE`).count() === 1, 'Node mới không được vẽ: ' + type);
    }
    const promptValues = {
      TEXT: 'AC02B - Chu de bai viet ve bien',
      IMAGE: 'AC02B - Anh bau troi bien luc binh minh',
      VIDEO: 'AC02B - Canh may quay luot ngang bo bien',
    };
    for (const [type, prompt] of Object.entries(promptValues)) await map(`AC.${type}.PROMPT`).fill(prompt);

    // Browser actual drag actions, never create edges from JS.
    await map('AC.CANVAS.FIT').click(); await page.waitForTimeout(550);
    await moveNode('TEXT', -12, -35);
    await moveNode('IMAGE', -20, 40);
    await moveNode('VIDEO', 4, 60);
    await map('AC.CANVAS.FIT').click(); await page.waitForTimeout(550);
    const toolbarBefore = await map('AC.CANVAS.TOOLBAR').boundingBox();
    const transform = page.locator('.vue-flow__transformationpane');
    await map('AC.CANVAS.ZOOM.IN').click(); await page.waitForTimeout(250);
    await map('AC.CANVAS.ZOOM.OUT').click(); await page.waitForTimeout(250);
    const toolbarAfter = await map('AC.CANVAS.TOOLBAR').boundingBox();
    assert(toolbarBefore && toolbarAfter && Math.abs(toolbarAfter.width - toolbarBefore.width) < 1, 'Thanh công cụ thay đổi kích thước sau zoom');

    assert(await map('AC.TEXT.OUTPUT').count() === 1 && await map('AC.TEXT.INPUT').count() === 0, 'Text handle sai');
    assert(await map('AC.IMAGE.INPUT').count() === 1 && await map('AC.IMAGE.OUTPUT').count() === 1, 'Image handle sai');
    assert(await map('AC.VIDEO.INPUT').count() === 1 && await map('AC.VIDEO.OUTPUT').count() === 0, 'Video handle sai');
    await connect('AC.TEXT.OUTPUT', 'AC.IMAGE.INPUT');
    assert(await page.locator('.vue-flow__edge').count() === 1, 'Kéo Text→Image không tạo edge');
    await connect('AC.IMAGE.OUTPUT', 'AC.VIDEO.INPUT');
    assert(await page.locator('.vue-flow__edge').count() === 2, 'Kéo Image→Video không tạo edge');
    await connect('AC.TEXT.OUTPUT', 'AC.VIDEO.INPUT');
    assert(await page.locator('.vue-flow__edge').count() === 3, 'Kéo Text→Video không tạo edge');

    // Invalid direction and duplicate attempts with actual mouse interaction.
    await connect('AC.VIDEO.INPUT', 'AC.TEXT.OUTPUT');
    assert(await page.locator('.vue-flow__edge').count() === 3, 'Video→Text đã tạo edge trái phép');
    assert(await map('AC.CANVAS.CONNECT.ERROR').count() === 1,
      'Nối sai chiều bằng chuột chưa có thông báo dễ hiểu');
    await connect('AC.TEXT.OUTPUT', 'AC.IMAGE.INPUT');
    assert(await page.locator('.vue-flow__edge').count() === 3, 'Cho phép tạo dây Text→Image trùng');
    assert(await map('AC.CANVAS.CONNECT.ERROR').count() === 1,
      'Nối trùng bằng chuột chưa có thông báo');

    const afterConnect = await getSaved(projectId, 3, 3);
    const types = new Set(afterConnect.nodes.map(n => n.type));
    assert(types.size === 3 && ['text','image','video'].every(t => types.has(t)), 'SQLite thiếu loại node');
    assert(new Set(afterConnect.nodes.map(n => n.id)).size === 3, 'nodeId bị trùng');
    assert(new Set(afterConnect.edges.map(e => e.id)).size === 3, 'edgeId bị trùng');
    for (const [type, prompt] of Object.entries(promptValues))
      assert(afterConnect.nodes.find(n => n.type === type.toLowerCase())?.data.content === prompt,
        'SQLite sai prompt ' + type);
    const byType = Object.fromEntries(afterConnect.nodes.map(n => [n.type, n.id]));
    const pairs = new Set(afterConnect.edges.map(e => `${e.source}>${e.target}`));
    for (const pair of [`${byType.text}>${byType.image}`, `${byType.image}>${byType.video}`, `${byType.text}>${byType.video}`])
      assert(pairs.has(pair), 'SQLite thiếu edge ' + pair);

    // Deliberately corrupt connections via direct HTTP; rejection must be atomic.
    const base = snapshot(afterConnect);
    const cases = [
      ['wrong type', { source: byType.image, target: byType.text, sourceHandle: 'output', targetHandle: 'input' }],
      ['wrong output handle', { source: byType.text, target: byType.video, sourceHandle: 'input', targetHandle: 'input' }],
      ['wrong input handle', { source: byType.text, target: byType.video, sourceHandle: 'output', targetHandle: 'output' }],
      ['unknown node', { source: byType.text, target: 'not_found', sourceHandle: 'output', targetHandle: 'input' }],
      ['self loop', { source: byType.image, target: byType.image, sourceHandle: 'output', targetHandle: 'input' }],
      ['duplicate pair', { source: byType.text, target: byType.image, sourceHandle: 'output', targetHandle: 'input' }],
    ];
    for (const [name, edge] of cases) {
      const mutation = { revision: afterConnect.revision, viewport: afterConnect.viewport,
        nodes: afterConnect.nodes, edges: [...afterConnect.edges, { id: `invalid_${name.replaceAll(' ', '_')}`, ...edge }] };
      const rejected = await api(`/api/projects/${projectId}/canvas`, 'PUT', mutation);
      assert(rejected.status === 400 && typeof rejected.body.message === 'string' && rejected.body.message,
        `${name}: API phải trả HTTP 400 rõ lý do, hiện trả ${rejected.status}`);
      assert(JSON.stringify(snapshot(await canvas(projectId))) === JSON.stringify(base), `${name}: SQLite bị ghi dở`);
    }

    // Select one actual edge on rendered SVG and delete only that edge.
    // Pick the Image→Video wire in the actual visible gap between those nodes.
    // Clicking the center of a complex SVG <g> is NOT valid when a node overlays
    // its bounding box; find an unoccluded spot on the SVG path instead.
    const edgeToDelete = afterConnect.edges.find(e => e.source === byType.image && e.target === byType.video);
    assert(edgeToDelete, 'Không thấy Image→Video');
    const hitPoint = await page.evaluate(edgeId => {
      const edge = document.querySelector(`.vue-flow__edge[data-id="${edgeId}"]`);
      if (!edge) return null;
      for (const path of edge.querySelectorAll('path')) {
        const length = path.getTotalLength?.();
        if (!length) continue;
        for (const percent of [.5, .35, .65, .2, .8]) {
          const point = path.getPointAtLength(length * percent), matrix = path.getScreenCTM();
          if (!matrix) continue;
          const x = matrix.a * point.x + matrix.c * point.y + matrix.e;
          const y = matrix.b * point.x + matrix.d * point.y + matrix.f;
          const top = document.elementFromPoint(x, y);
          if (top && (top === path || edge.contains(top))) return {x, y};
        }
      }
      return null;
    }, edgeToDelete.id);
    assert(hitPoint, 'Không thể tìm điểm thực tế có thể bấm của dây Image→Video');
    await page.mouse.click(hitPoint.x, hitPoint.y);
    await map('AC.CANVAS.EDGE.DELETE').waitFor({state:'visible'});
    await map('AC.CANVAS.EDGE.DELETE').click();
    assert(await page.locator('.vue-flow__edge').count() === 2, 'Không xóa đúng một edge');
    await map('AC.CANVAS.FIT').click(); await page.waitForTimeout(550);
    const beforeRefresh = snapshot(await getSaved(projectId, 3, 2));
    assert(!beforeRefresh.edges.some(e => e.id === edgeToDelete.id), 'SQLite vẫn còn edge đã xóa');
    assert(beforeRefresh.nodes.every(n => Number.isFinite(n.position.x) && Number.isFinite(n.position.y)), 'Tọa độ node sai');
    assert(Number.isFinite(beforeRefresh.viewport.zoom) && beforeRefresh.viewport.zoom > 0, 'Viewport chưa lưu');
    const transformBefore = await transform.getAttribute('style');
    await page.reload();
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${projectId}"]`).click();
    await map('AC.VIDEO.PROMPT').waitFor({ state: 'visible' }); await page.waitForTimeout(350);
    for (const [type, prompt] of Object.entries(promptValues))
      assert(await map(`AC.${type}.PROMPT`).inputValue() === prompt, 'Prompt không khôi phục ' + type);
    assert(JSON.stringify(snapshot(await canvas(projectId))) === JSON.stringify(beforeRefresh), 'Snapshot thay đổi sau refresh');
    assert(await page.locator('.vue-flow__edge').count() === 2, 'DOM thiếu edge sau refresh');
    assert(transformBefore === await transform.getAttribute('style'), 'Viewport DOM không khôi phục');
    const requiredMapIds = ['AC.CANVAS.ADD.NODE.TEXT','AC.CANVAS.ADD.NODE.IMAGE','AC.CANVAS.ADD.NODE.VIDEO',
      'AC.TEXT.NODE','AC.TEXT.PROMPT','AC.TEXT.OUTPUT','AC.IMAGE.NODE','AC.IMAGE.PROMPT',
      'AC.IMAGE.INPUT','AC.IMAGE.OUTPUT','AC.VIDEO.NODE','AC.VIDEO.PROMPT','AC.VIDEO.INPUT',
      'AC.CANVAS.CONNECT','AC.CANVAS.NODE.DELETE'];
    await map('AC.CANVAS.ADD.NODE').click();
    for (const id of requiredMapIds) assert(await map(id).count() > 0, 'MapID thiếu: ' + id);
    await map('AC.CANVAS.ADD.NODE').click();
    assert(network.some(s => s.startsWith('PUT /api/projects/') && s.endsWith(': 200')), 'Network không có PUT 200');
    assert(network.some(s => s.endsWith(': 400')), 'Network không có PUT 400 bị chặn');
    assert(browserProblems.length === 0, 'Console/Page errors: ' + browserProblems.join(' | '));
    const health = await api('/api/health');
    assert(health.status === 200 && health.body.database === 'connected', 'AC-01 health hồi quy');
    await page.evaluate(({id, before}) => sessionStorage.setItem('AC02B_ACCEPTANCE', JSON.stringify({id, before})),
      {id: projectId, before: beforeRefresh});
    return { result:'PASS', projectId, canvasId: beforeRefresh.id,
      ids: beforeRefresh.nodes.map(n => ({ id:n.id, type:n.type, position:n.position })),
      edges: beforeRefresh.edges, viewport: beforeRefresh.viewport, revision: beforeRefresh.revision,
      backendRejections: cases.map(c => c[0]), prompts: promptValues,
      network: [...new Set(network)].slice(-16), consoleErrors: browserProblems.length,
      checked:'actual handle-to-handle mouse drag; three valid pairs; wrong direction; duplicate; API invalid; edge delete; autosave; SQLite; refresh; viewport; MapID; AC01 health' };
  } finally {
    page.off('console', onError); page.off('pageerror', onPageError); page.off('response', onResponse);
  }
}
