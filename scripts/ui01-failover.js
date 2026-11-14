// UI-01 real-browser autosave failover test (503 retry + 409 optimistic lock).
// Self-contained: creates its own uniquely named project in an ISOLATED SQLite DB.
// No pre-existing project / sessionStorage baseline is required.
// npx --yes playwright@1.65.1 cli -s=ui01qa run-code --filename scripts/ui01-failover.js
async (page) => {
  // The CLI sandbox has no Node environment bindings; use isolated test URL.
  const webUrl = 'http://127.0.0.1:5184/';
  const root = 'docs/evidence/ui01';
  const projectName = `UI01 Failover QA ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const map = (id) => page.locator(`[data-map-id="${id}"]`);
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const api = async (path, method = 'GET', payload) => page.evaluate(async ({ path, method, payload }) => {
    const options = { method };
    if (payload !== undefined) {
      options.headers = { 'content-type': 'application/json' };
      options.body = JSON.stringify(payload);
    }
    const response = await fetch(path, options);
    return { status: response.status, body: await response.json() };
  }, { path, method, payload });
  const shot = async (name) => page.screenshot({ path: `${root}/${name}.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(webUrl);
  await map('AC.HOME').waitFor({ state: 'visible' });
  await map('AC.HOME.NEW').first().click();
  await map('AC.HOME.NEW.NAME').fill(projectName);
  await map('AC.HOME.NEW.CREATE').click();
  await map('AC.CANVAS').waitFor({ state: 'visible' });
  const list = await api('/api/projects');
  assert(list.status === 200, 'Project list API unavailable');
  const project = list.body.projects.find((entry) => entry.name === projectName);
  assert(project?.id, 'Unique failover project was not created');
  const id = project.id;
  const canvasPath = `/api/projects/${id}/canvas`;
  const routePattern = `**${canvasPath}`;

  // Seed real node content and wait for a successful SQLite save. The 503
  // simulation begins only after this baseline has been fully acknowledged.
  await map('AC.CANVAS.ADD.NODE').click();
  await map('AC.CANVAS.ADD.NODE.TEXT').click();
  await map('AC.CANVAS.ADD.NODE').click();
  await map('AC.CANVAS.ADD.NODE.IMAGE').click();
  await map('AC.TEXT.PROMPT').fill('Bản nháp đối chứng UI01');
  await map('AC.IMAGE.PROMPT').fill('Khung hình đối chứng UI01');
  let baseline;
  for (let attempt = 0; attempt < 65; attempt++) {
    const current = await api(canvasPath);
    if (current.status === 200 && current.body.canvas?.nodes?.length === 2 &&
        current.body.canvas.nodes.some((node) => node.type === 'text' && node.data.content === 'Bản nháp đối chứng UI01') &&
        current.body.canvas.nodes.some((node) => node.type === 'image' && node.data.content === 'Khung hình đối chứng UI01')) {
      baseline = current.body.canvas;
      break;
    }
    await page.waitForTimeout(220);
  }
  assert(baseline, 'Initial Text/Image content not saved before testing failover');
  await page.waitForFunction(() =>
    document.querySelector('[data-map-id="AC.CANVAS.SAVE.STATUS"]')?.classList.contains('saved'),
    null, { timeout: 15000 });

  // Only intercept PUT to this one test project's Canvas; GET remains real.
  const injected503 = async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 503, contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'UI01 test: SQLite tạm thời không khả dụng' }),
      });
    } else {
      await route.continue();
    }
  };
  await page.route(routePattern, injected503);
  let simulated503 = false;
  try {
    const currentText = await map('AC.IMAGE.PROMPT').inputValue();
    await map('AC.IMAGE.PROMPT').fill(currentText + ' — thay đổi khi máy chủ lỗi');
    await map('AC.CANVAS.SAVE.ERROR').waitFor({ state: 'visible', timeout: 15000 });
    simulated503 = true;
    await shot('after-api-503-1440x900');
    assert((await map('AC.IMAGE.PROMPT').inputValue()).includes('khi máy chủ lỗi'),
      '503 lost locally edited prompt');
    const serverDuringFailure = await api(canvasPath);
    assert(serverDuringFailure.status === 200 &&
      !serverDuringFailure.body.canvas.nodes.some((node) => node.data.content.includes('khi máy chủ lỗi')),
      '503 simulation unexpectedly changed SQLite');
  } finally {
    await page.unroute(routePattern, injected503);
  }
  assert(simulated503, 'Failed to reproduce the 503 save state');

  await map('AC.CANVAS.SAVE.RETRY').click();
  await page.waitForFunction(async (projectId) => {
    const response = await fetch(`/api/projects/${projectId}/canvas`);
    const data = await response.json();
    return data.canvas?.nodes?.some((node) => node.data.content.includes('khi máy chủ lỗi'));
  }, id, { timeout: 15000 });
  await page.waitForFunction(() =>
    document.querySelector('[data-map-id="AC.CANVAS.SAVE.STATUS"]')?.classList.contains('saved'),
    null, { timeout: 15000 });

  // Simulate another tab saving the current revision directly through API.
  // This increments server revision without changing the local Vue Flow graph.
  const beforeConflict = await api(canvasPath);
  assert(beforeConflict.status === 200, 'Cannot read Canvas for concurrency test');
  const remoteSave = await api(canvasPath, 'PUT', {
    revision: beforeConflict.body.canvas.revision,
    nodes: beforeConflict.body.canvas.nodes,
    edges: beforeConflict.body.canvas.edges,
    viewport: beforeConflict.body.canvas.viewport,
  });
  assert(remoteSave.status === 200 &&
    remoteSave.body.canvas.revision === beforeConflict.body.canvas.revision + 1,
    'Failed to simulate concurrent cross-tab save');

  const localDraft = 'UI01 draft conflict - preserve local input';
  await map('AC.TEXT.PROMPT').fill(localDraft);
  await map('AC.CANVAS.SAVE.CONFLICT').waitFor({ state: 'visible', timeout: 15000 });
  await shot('after-api-409-1440x900');
  assert(await map('AC.TEXT.PROMPT').inputValue() === localDraft,
    '409 revision conflict discarded local prompt');
  const afterConflict = await api(canvasPath);
  assert(afterConflict.status === 200 &&
    afterConflict.body.canvas.revision === remoteSave.body.canvas.revision,
    '409 conflict overwrote newer server revision');
  assert(!afterConflict.body.canvas.nodes.some((node) => node.data.content === localDraft),
    'Rejected 409 draft unexpectedly reached SQLite');

  return {
    result: 'PASS', projectName, projectId: id,
    injected503: true, local503DraftPreserved: true,
    retryPersistedToSQLite: true, conflictingRevision409Visible: true,
    rejected409DraftPreserved: true, newerSQLiteRevisionUnchanged: true,
    serverRevision: afterConflict.body.canvas.revision,
  };
}
