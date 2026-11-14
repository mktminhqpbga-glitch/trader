// UI-01 real-browser visual and functional smoke test.
// Playwright CLI run-code expects the async(page) function below, not a Node entrypoint.
// Start an ISOLATED Bun/Vite dev server on port 5184; never use the user database.
// npx --yes playwright@1.65.1 cli -s=ui01qa run-code --filename scripts/ui01-visual-qa.js
async (page) => {
  // The CLI sandbox has no Node environment bindings; use isolated test URL.
  const webUrl = 'http://127.0.0.1:5184/';
  // Screenshot paths are relative to the repository root / CLI working directory.
  const root = 'docs/evidence/ui01';
  const projectName = `UI01 Visual QA ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const map = (id) => page.locator(`[data-map-id="${id}"]`);
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const sizes = [[1440, 900], [1280, 800], [1024, 768], [390, 844]];
  const errors = [];
  const requests = [];
  const onError = (error) => errors.push(error.message);
  const onResponse = (response) => {
    if (response.url().includes('/api/')) {
      requests.push(`${response.request().method()} ${new URL(response.url()).pathname} ${response.status()}`);
    }
  };
  const shot = async (state) => page.screenshot({ path: `${root}/${state}.png`, fullPage: true });
  const api = async (path) => page.evaluate(async (path) => {
    const response = await fetch(path);
    return { status: response.status, body: await response.json() };
  }, path);

  page.on('pageerror', onError);
  page.on('response', onResponse);
  try {
    await page.goto(webUrl);
    await map('AC.UI.PROJECT.LIBRARY').waitFor({ state: 'visible' });
    assert(await map('AC.UI.TOPBAR').count() === 1, 'Topbar MapID missing');
    assert(await map('AC.UI.LEFT.RAIL').count() === 1, 'Left rail MapID missing');
    await page.waitForTimeout(350);
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await shot(`after-library-${width}x${height}`);
    }

    // A unique project makes this script rerunnable on a persistent isolated test DB.
    await page.setViewportSize({ width: 1440, height: 900 });
    await map('AC.HOME.NEW').first().click();
    await map('AC.HOME.NEW.NAME').fill(projectName);
    await map('AC.HOME.NEW.CREATE').click();
    await map('AC.CANVAS').waitFor({ state: 'visible' });
    const projectList = await api('/api/projects');
    assert(projectList.status === 200, 'Project list API unavailable');
    const project = projectList.body.projects.find((item) => item.name === projectName);
    assert(project?.id, 'New unique UI01 project missing from API');
    const id = project.id;

    // Test library search against the new project rather than a hardcoded
    // project from a previous manual acceptance run.
    await map('AC.HOME.PROJECTS').click();
    await map('AC.HOME').waitFor({ state: 'visible' });
    const search = page.locator('.librarySearch input');
    await search.fill(projectName);
    assert(await map('AC.HOME.OPEN').count() === 1, 'Library search did not filter to one project');
    assert(await map('AC.HOME.OPEN').getAttribute('data-project-id') === id, 'Library search returned the wrong project');
    await search.fill('');
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();
    await map('AC.CANVAS').waitFor({ state: 'visible' });

    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await shot(`after-canvas-empty-${width}x${height}`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    assert(await map('AC.UI.CANVAS.TOOLBAR').count() === 1, 'Canvas toolbar MapID missing');
    await map('AC.CANVAS.ADD.NODE').click();
    await map('AC.UI.NODE.PALETTE').waitFor({ state: 'visible' });
    await map('AC.UI.NODE.SEARCH').fill('vid');
    assert(await map('AC.CANVAS.ADD.NODE.VIDEO').count() === 1, 'Node palette search does not match Video');
    assert(await map('AC.CANVAS.ADD.NODE.TEXT').count() === 0, 'Node palette search did not filter Text');
    await shot('after-palette-search-1440x900');
    await map('AC.UI.NODE.SEARCH').fill('');
    await shot('after-node-palette-1440x900');

    await map('AC.CANVAS.ADD.NODE.TEXT').click();
    for (const type of ['IMAGE', 'VIDEO']) {
      await map('AC.CANVAS.ADD.NODE').click();
      await map(`AC.CANVAS.ADD.NODE.${type}`).click();
    }
    await map('AC.TEXT.PROMPT').fill('Câu chuyện về hoàng hôn và chuyến tàu');
    await map('AC.IMAGE.PROMPT').fill('Khung hình ban đêm, neon tím tinh tế');
    await map('AC.VIDEO.PROMPT').fill('Camera dolly nhẹ trong 5 giây');
    assert((await map('AC.IMAGE.RESULT').innerText()).includes('Chưa có kết quả — Chưa kết nối AI'), 'Image falsely displays a result');
    assert((await map('AC.VIDEO.RESULT').innerText()).includes('Chưa có kết quả — Chưa kết nối AI'), 'Video falsely displays a result');
    await map('AC.CANVAS.FIT').click();
    await page.waitForTimeout(500);

    const connect = async (source, target) => {
      const from = await map(source).boundingBox();
      const to = await map(target).boundingBox();
      assert(from && to, `Missing real connection handles: ${source}/${target}`);
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down();
      await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 30 });
      await page.mouse.up();
      await page.waitForTimeout(250);
    };
    await connect('AC.TEXT.OUTPUT', 'AC.IMAGE.INPUT');
    await connect('AC.IMAGE.OUTPUT', 'AC.VIDEO.INPUT');
    await connect('AC.TEXT.OUTPUT', 'AC.VIDEO.INPUT');
    assert(await page.locator('.vue-flow__edge').count() === 3, 'Expected 3 real Vue Flow edge connections');
    await page.waitForTimeout(950);
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await shot(`after-workflow-${width}x${height}`);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await map('AC.IMAGE.NODE').locator('.node-drag-handle').click();
    await map('AC.UI.INSPECTOR').waitFor({ state: 'visible' });
    await shot('after-image-selected-inspector-1440x900');
    await map('AC.UI.INSPECTOR.PROMPT').fill('Ảnh ánh sáng tím, máy ảnh góc rộng');
    assert(await map('AC.IMAGE.PROMPT').inputValue() === 'Ảnh ánh sáng tím, máy ảnh góc rộng',
      'Inspector edit did not update actual image node');
    await map('AC.UI.INSPECTOR.CLOSE').click();
    assert(await map('AC.UI.INSPECTOR').count() === 0, 'Inspector not closed');
    await shot('after-panels-closed-1440x900');
    await map('AC.VIDEO.NODE').locator('.node-drag-handle').click();
    await map('AC.UI.INSPECTOR').waitFor({ state: 'visible' });
    await shot('after-video-selected-inspector-1440x900');

    await map('AC.UI.PANEL.TOGGLE').click();
    await map('AC.UI.PROJECT.LIBRARY').waitFor({ state: 'visible' });
    await shot('after-project-drawer-1440x900');
    const projectMenu = page.locator(`[data-map-id="AC.HOME.PROJECT.MENU"][data-project-id="${id}"]`);
    await projectMenu.click();
    await page.locator(`[data-map-id="AC.HOME.PROJECT.RENAME"][data-project-id="${id}"]`).click();
    await map('AC.HOME.PROJECT.RENAME.DIALOG').waitFor({ state: 'visible' });
    await shot('after-rename-dialog-1440x900');
    const beforeRename = requests.filter((value) => value.startsWith(`PATCH /api/projects/${id} `)).length;
    await map('AC.HOME.PROJECT.RENAME.CANCEL').click();
    assert(requests.filter((value) => value.startsWith(`PATCH /api/projects/${id} `)).length === beforeRename,
      'Cancel rename unexpectedly issued PATCH');

    await projectMenu.click();
    await page.locator(`[data-map-id="AC.HOME.PROJECT.DELETE"][data-project-id="${id}"]`).click();
    await map('AC.HOME.PROJECT.DELETE.DIALOG').waitFor({ state: 'visible' });
    await shot('after-delete-dialog-1440x900');
    const beforeDelete = requests.filter((value) => value.startsWith(`DELETE /api/projects/${id} `)).length;
    await map('AC.HOME.PROJECT.DELETE.CANCEL').click();
    assert(requests.filter((value) => value.startsWith(`DELETE /api/projects/${id} `)).length === beforeDelete,
      'Cancel delete unexpectedly issued DELETE');
    await map('AC.UI.PANEL.TOGGLE').click();

    // Check SQLite API ACK and ensure full snapshot survives reload.
    const expectedPrompt = 'Ảnh ánh sáng tím, máy ảnh góc rộng';
    let before;
    for (let attempt = 0; attempt < 50; attempt++) {
      const current = await api(`/api/projects/${id}/canvas`);
      if (current.status === 200 && current.body.canvas?.nodes?.length === 3 &&
          current.body.canvas.edges?.length === 3 &&
          current.body.canvas.nodes.some((node) => node.data.content === expectedPrompt)) {
        before = current.body.canvas;
        break;
      }
      await page.waitForTimeout(250);
    }
    assert(before, 'SQLite did not persist workflow and Inspector prompt');
    const snapshot = (canvas) => JSON.stringify({
      id: canvas.id, revision: canvas.revision, viewport: canvas.viewport,
      nodes: canvas.nodes.map((node) => ({
        id: node.id, type: node.type, position: node.position, content: node.data.content,
      })),
      edges: canvas.edges.map((edge) => ({
        id: edge.id, source: edge.source, target: edge.target,
        sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle,
      })),
    });
    await page.reload();
    await map('AC.HOME').waitFor({ state: 'visible' });
    await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${id}"]`).click();
    await map('AC.CANVAS').waitFor({ state: 'visible' });
    const afterResponse = await api(`/api/projects/${id}/canvas`);
    assert(afterResponse.status === 200, 'Canvas inaccessible after reload');
    assert(snapshot(before) === snapshot(afterResponse.body.canvas),
      'Saved canvas snapshot changed after reload (IDs, revision, viewport, nodes, edges)');
    assert(await page.locator('.vue-flow__edge').count() === 3, 'Edges not restored in Vue Flow');
    assert(errors.length === 0, `Browser JavaScript errors: ${errors.join(' | ')}`);
    return {
      result: 'PASS', projectName, projectId: id,
      responsiveSizes: sizes.map(([w, h]) => `${w}x${h}`),
      threeRealEdges: true, librarySearch: true, paletteSearch: true,
      inspectorUpdatesNode: true, projectDialogsCancel: true,
      reloadPreservesSnapshot: true, browserErrors: errors,
      recentApiRequests: requests.slice(-30),
    };
  } finally {
    page.off('pageerror', onError);
    page.off('response', onResponse);
  }
}
