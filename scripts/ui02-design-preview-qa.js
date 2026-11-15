// UI-02 A/B live browser QA (DEV Vite only; no backend/SQLite).
// Open the isolated Vite preview in the SAME CLI session before run-code:
// npx --yes playwright@1.65.1 cli -s=ui02preview open http://127.0.0.1:5193/?designPreview=A
// npx --yes playwright@1.65.1 cli -s=ui02preview run-code --filename scripts/ui02-design-preview-qa.js
async (page) => {
  const root = "docs/evidence/ui02/review-";
  const shots = [], errors = [], apiCalls = [], edgeProbe = [], checks = [];
  const onError = error => errors.push(error.message);
  const isApi = url => /\/api(?:\/|$)/.test(new URL(url).pathname);
  const onRequest = request => { if (isApi(request.url())) apiCalls.push(request.url()); };
  const onSocket = socket => { if (isApi(socket.url())) apiCalls.push(socket.url()); };
  page.on("pageerror", onError); page.on("request", onRequest);
  page.on("websocket", onSocket);
  const assert = (pass, message) => { if (!pass) throw Error(message); };
  const initialUrl = new URL(page.url());
  assert(/^https?:$/.test(initialUrl.protocol) && /^(A|B)$/.test(initialUrl.searchParams.get("designPreview") || ""),
    "Open the A/B DEV preview in this Playwright session before run-code, e.g. http://127.0.0.1:5193/?designPreview=A");
  const origin = initialUrl.origin;
  const threeNodes = ["preview-text-01", "preview-image-01", "preview-video-01"];
  const sevenNodes = [...threeNodes, "preview-text-02", "preview-image-02", "preview-image-03", "preview-video-02"];
  const threeEdges = ["preview-edge-01", "preview-edge-02", "preview-edge-03"];
  const sevenEdges = [...threeEdges, "preview-edge-04", "preview-edge-05"];
  const map = id => page.locator('[data-map-id="' + id + '"]');
  const shot = async (variant, name) => {
    const path = root + variant + "/" + name + ".png";
    await page.screenshot({ path, fullPage: true, animations: "disabled" });
    shots.push(path);
  };
  const goto = async (variant, query) => {
    await page.goto(origin + "/?designPreview=" + variant + (query ? "&" + query : ""));
    await map("AC.UI02.PREVIEW.ROOT").waitFor({state:"visible"});
    assert(await map("AC.UI02.PREVIEW.MODE." + variant).getAttribute("aria-pressed") === "true", "Incorrect design mode " + variant);
  };
  // Count live Vue Flow SVG edges and verify the exact seeded IDs/paths. The
  // label "3 kết nối" alone is not evidence that the edges were rendered.
  const graph = async (nodeIds, edgeIds, stage) => {
    try {
      await page.waitForFunction(({ nodeIds, edgeIds }) => {
        const nodes = [...document.querySelectorAll(".vue-flow__node")];
        const edges = [...document.querySelectorAll(".vue-flow__edge")];
        const nodeNames = nodes.map(el => el.getAttribute("data-id"));
        const edgeNames = edges.map(el => el.getAttribute("data-id"));
        return nodeNames.length === nodeIds.length && edgeNames.length === edgeIds.length
          && nodeIds.every(id => nodeNames.includes(id)) && edgeIds.every(id => edgeNames.includes(id))
          && edges.every(el => {
            const path = el.querySelector(".vue-flow__edge-path");
            const d = path && path.getAttribute("d");
            return d && d.startsWith("M") && d.length > 18 && !/NaN|undefined/.test(d);
          });
      }, { nodeIds, edgeIds }, { timeout: 12000 });
    } catch {
      const meta = await page.locator(".previewCanvasInfo").innerText();
      const state = await page.locator(".previewCanvasInfo").getAttribute("data-flow-state");
      const dom = await page.locator(".vue-flow__edge").evaluateAll(elements => elements.map(el => ({id:el.getAttribute("data-id"), path:el.querySelector(".vue-flow__edge-path")?.getAttribute("d")})));
      throw Error(stage + ": Vue Flow graph missing/invalid: nodes=" + nodeIds.length + " edges=" + JSON.stringify(edgeIds) + " actual=" + JSON.stringify(dom) + " meta=" + meta + " state=" + state);
    }
    const meta = await page.locator(".previewCanvasInfo").innerText();
    assert(meta.includes(nodeIds.length + " node · " + edgeIds.length + " kết nối"), stage + ": displayed count disagrees with Vue Flow: " + meta);
    edgeProbe.push({ stage, nodes: nodeIds.length, edges: edgeIds.length, meta });
    checks.push(stage);
  };
  const zoomNumber = async () => Number((await page.locator(".previewZoom").innerText()).replace("%", ""));
  const dragNode = async () => {
    const node = page.locator('[data-preview-node="preview-text-01"]');
    const before = await node.boundingBox();
    const header = await node.locator(".node-drag-handle").boundingBox();
    assert(before && header, "Cannot find draggable Text node header");
    const x = header.x + 36, y = header.y + header.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 76, y + 42, {steps:18});
    await page.mouse.up();
    const after = await node.boundingBox();
    assert(after && Math.hypot(after.x-before.x, after.y-before.y) > 24,
      "Dragging the real Text node did not move its DOM bounding box");
    checks.push("real node drag");
  };
  const panCanvas = async () => {
    const pane = page.locator(".vue-flow__pane");
    const transformation = page.locator(".vue-flow__transformationpane");
    const translation = async () => transformation.evaluate(element => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { x: matrix.m41, y: matrix.m42 };
    });
    const target = await pane.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const offsets = [[76,-30],[-76,30]];
      for (const [px,py] of [[.75,.82],[.16,.78],[.85,.57],[.12,.55],[.55,.9]]) {
        const x = rect.left + rect.width*px, y = rect.top + rect.height*py;
        for (const [dx,dy] of offsets) {
          if (document.elementFromPoint(x,y) === element && document.elementFromPoint(x+dx,y+dy) === element) {
            return {x,y,dx,dy};
          }
        }
      }
      return null;
    });
    assert(target, "No unobstructed Vue Flow pane location found for real panning");
    const before = await translation();
    await page.mouse.move(target.x, target.y);
    await page.mouse.down();
    await page.mouse.move(target.x+target.dx, target.y+target.dy, {steps:16});
    await page.mouse.up();
    await page.waitForFunction(({x,y}) => {
      const element = document.querySelector(".vue-flow__transformationpane");
      if (!element) return false;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return Math.hypot(matrix.m41-x, matrix.m42-y) > 12;
    }, before, {timeout:8000});
    const after = await translation();
    assert(Math.hypot(after.x-before.x, after.y-before.y) > 12,
      "Real mouse pan did not translate the Vue Flow transformation pane: " + JSON.stringify({before,after}));
    checks.push("real canvas pan");
  };
  const testZoomAndFit = async () => {
    const before = await zoomNumber();
    await map("AC.UI02.PREVIEW.ZOOM.IN").click();
    await page.waitForFunction(oldZoom => Number(document.querySelector(".previewZoom")?.textContent?.replace("%", "")) > oldZoom, before);
    await page.waitForTimeout(220); // zoomIn duration is 160ms.
    const increased = await zoomNumber();
    assert(increased > before, "Zoom In button did not increase Vue Flow zoom");
    await map("AC.UI02.PREVIEW.ZOOM.OUT").click();
    await page.waitForFunction(oldZoom => Number(document.querySelector(".previewZoom")?.textContent?.replace("%", "")) < oldZoom, increased);
    await page.waitForTimeout(220); // Verify after zoomOut has settled.
    assert(await zoomNumber() < increased, "Zoom Out button did not decrease Vue Flow zoom");
    await map("AC.UI02.PREVIEW.FIT").click();
    await page.waitForTimeout(300); // Vue Flow fitView animation is 240ms.
    const stage = await map("AC.UI02.PREVIEW.STAGE").boundingBox();
    assert(stage, "Canvas stage is not visible after fit");
    for (const id of threeNodes) {
      const box = await page.locator('[data-preview-node="' + id + '"]').boundingBox();
      assert(box && box.x >= stage.x - 10 && box.y >= stage.y - 10 && box.x+box.width <= stage.x+stage.width+10 && box.y+box.height <= stage.y+stage.height+10,
        "Fit View did not contain node " + id + " within the canvas stage");
    }
    checks.push("real zoom in/out and fit view");
  };
  const selectNode = async id => {
    if (await map("AC.UI02.PREVIEW.INSPECTOR").count()) await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
    const node = page.locator('[data-preview-node="' + id + '"]');
    await node.locator(".previewNodeHeader").click();
    await node.locator('[data-map-id="AC.UI02.PREVIEW.NODE.INSPECT"]').click();
    await map("AC.UI02.PREVIEW.INSPECTOR").waitFor({state:"visible"});
    return node;
  };
  try {
    for (const variant of ["A","B"]) {
      await page.setViewportSize({width:1440,height:900});
      await goto(variant, "screen=library");
      assert(await map("AC.UI02.PREVIEW.LIBRARY").isVisible(), variant + ": library not visible");
      assert(await page.locator(".previewProjectCard").count() === 3, variant + ": 3 distinct project demo cards expected");
      await shot(variant,"01-project-library");
      await map("AC.UI02.PREVIEW.LIBRARY.MODE").selectOption("empty");
      assert(await map("AC.UI02.PREVIEW.LIBRARY.EMPTY").isVisible(), variant + ": library empty state missing");
      assert(await page.locator(".previewProjectCard").count() === 0, variant + ": library empty state contains project cards");
      await shot(variant,"02-project-library-empty");
      await goto(variant,"scenario=empty");
      await map("AC.UI02.PREVIEW.EMPTY").waitFor({state:"visible"});
      await graph([],[],variant + ": empty canvas");
      assert(await page.locator(variant === "A" ? ".previewFloatDock" : ".previewSceneRail").isVisible(), variant + ": variant-specific layout missing");
      if (variant === "B") assert(await page.locator(".previewShotStrip").isVisible(), "B: cinematic filmstrip missing");
      await shot(variant,"03-canvas-empty");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await graph(threeNodes,threeEdges,variant + ": 3-node workflow");
      await map("AC.UI02.PREVIEW.MEDIA").selectOption("compact");
      await graph(threeNodes,threeEdges,variant + ": compact media");
      assert(await page.locator(".previewMedia").count()===0, "Compact state falsely contains media");
      assert(await page.locator(".previewMediaUnavailable").count()===2, "Compact media must explain AI is disconnected on Image and Video");
      await selectNode("preview-text-01");
      await shot(variant,"04-text-node");
      await selectNode("preview-image-01");
      await shot(variant,"05-image-node-compact");
      await selectNode("preview-video-01");
      await shot(variant,"06-video-node-compact");
      await map("AC.UI02.PREVIEW.MEDIA").selectOption("demo");
      assert(await page.locator(".previewMedia").count()===2, "DEMO media count mismatch");
      await page.waitForFunction(() => {
        const images = [...document.querySelectorAll(".previewMedia img")];
        return images.length === 1 && images.every(img => img.complete && img.naturalWidth > 0);
      }, null, {timeout:10000});
      await selectNode("preview-image-01");
      await shot(variant,"07-image-node-with-demo-media");
      await selectNode("preview-video-01");
      assert(await page.locator("video[controls]").count()===1 && await page.locator("video[controls]").getAttribute("src") !== null, "Native DEMO video controls/source missing");
      await shot(variant,"08-video-node-with-demo-media");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await graph(threeNodes,threeEdges,variant + ": 3 seeded connections after media/Inspector");
      await map("AC.UI02.PREVIEW.FIT").click();
      await page.waitForTimeout(300);
      await shot(variant,"09-three-nodes-connected");
      await dragNode();
      await graph(threeNodes,threeEdges,variant + ": three edges after node drag");
      await shot(variant,"21-node-dragged");
      await panCanvas();
      await graph(threeNodes,threeEdges,variant + ": three edges after pane pan");
      await shot(variant,"22-canvas-panned");
      await testZoomAndFit();
      await graph(threeNodes,threeEdges,variant + ": three edges after zoom/fit");
      await shot(variant,"23-canvas-fitted");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("seven");
      await graph(sevenNodes,sevenEdges,variant + ": seven seeded nodes and five edges");
      await map("AC.UI02.PREVIEW.FIT").click();
      await page.waitForTimeout(300);
      await shot(variant,"10-seven-nodes-workflow");
      const image = await selectNode("preview-image-01");
      await shot(variant,"11-node-selected");
      assert(await map("AC.UI02.PREVIEW.NODE.TOOLBAR").count()===1,"Context toolbar missing");
      await shot(variant,"12-node-context-toolbar");
      await image.locator(".nodeMore").click();
      assert(await image.locator(".previewNodeMenu").isVisible(),"Node menu missing");
      await shot(variant,"13-node-menu");
      await image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
      assert(await page.locator(".previewDialog[open]").count()===1, "Delete menu did not open native confirmation");
      await map("AC.UI02.PREVIEW.DELETE.CANCEL").click();
      await graph(sevenNodes,sevenEdges,variant + ": cancel delete preserves graph");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await map("AC.UI02.PREVIEW.TOOLBAR").locator(".previewCreateButton").click();
      const search = map("AC.UI02.PREVIEW.PALETTE").locator("input[type=search]");
      await search.fill("video");
      assert(await map("AC.UI02.PREVIEW.ADD.VIDEO").count()===1 && await map("AC.UI02.PREVIEW.ADD.TEXT").count()===0,"Palette filter broken");
      await search.fill("");
      await shot(variant,"14-node-palette");
      await page.keyboard.press("Escape");
      assert(await map("AC.UI02.PREVIEW.PALETTE").count()===0, "Escape did not dismiss Palette");
      await map("AC.UI02.PREVIEW.TOOLBAR").locator(".previewCreateButton").click();
      await map("AC.UI02.PREVIEW.ADD.IMAGE").click();
      await graph([...sevenNodes,"preview-image-added-8"],sevenEdges,variant + ": palette adds a real in-memory Image node");
      assert(await map("AC.UI02.PREVIEW.PALETTE").count()===0, "Palette stayed open after adding a node");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await graph(threeNodes,threeEdges,variant + ": reset after palette addition (three)");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("seven");
      await graph(sevenNodes,sevenEdges,variant + ": reset after palette addition");
      await selectNode("preview-video-01");
      await map("AC.UI02.PREVIEW.INSPECTOR.PROMPT").fill("Dolly camera 35mm, ánh sáng ven đường, cảnh đêm.");
      assert((await page.locator('[data-preview-node="preview-video-01"] .previewPromptSummary').innerText()).includes("Dolly"),"Prompt desynchronized");
      await shot(variant,"15-inspector-open");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await shot(variant,"16-inspector-closed");
      const imageAgain = await selectNode("preview-image-01");
      const longPrompt = "Ánh sáng điện ảnh và chuyển động máy quay. ".repeat(24);
      await map("AC.UI02.PREVIEW.INSPECTOR.PROMPT").fill(longPrompt);
      await imageAgain.locator(".previewExpand").click();
      assert((await imageAgain.locator("textarea").inputValue())===longPrompt,"Long prompt lost");
      await shot(variant,"17-long-prompt");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await selectNode("preview-video-02");
      await page.waitForTimeout(300); // Inspector avoidance uses a 180ms viewport transition.
      const nodeBox = await page.locator('[data-preview-node="preview-video-02"]').boundingBox();
      const inspectorBox = await map("AC.UI02.PREVIEW.INSPECTOR").boundingBox();
      assert(nodeBox && inspectorBox, "Right-edge node or Inspector is missing");
      const overlapW = Math.max(0,Math.min(nodeBox.x+nodeBox.width,inspectorBox.x+inspectorBox.width)-Math.max(nodeBox.x,inspectorBox.x));
      const overlapH = Math.max(0,Math.min(nodeBox.y+nodeBox.height,inspectorBox.y+inspectorBox.height)-Math.max(nodeBox.y,inspectorBox.y));
      assert(overlapW*overlapH<60, "Inspector overlaps selected right-edge Video node (" + overlapW + "x" + overlapH + ")");
      await shot(variant,"18-right-edge-node-selected");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("offline");
      assert((await map("AC.UI02.PREVIEW.SIMULATED.STATUS").innerText()).includes("offline"), "Offline preview state missing");
      await shot(variant,"24-offline-demo");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("save503");
      assert((await map("AC.UI02.PREVIEW.SIMULATED.STATUS").innerText()).includes("KHÔNG GỌI API"),"Simulated status not identified");
      await shot(variant,"19-save-error");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("conflict409");
      assert((await map("AC.UI02.PREVIEW.SIMULATED.STATUS").innerText()).includes("409"), "Conflict preview state missing");
      await shot(variant,"20-revision-conflict");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("normal");
      assert(await map("AC.UI02.PREVIEW.SIMULATED.STATUS").count()===0, "Preview error state did not clear");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await graph(threeNodes,threeEdges,variant + ": reset responsive state");
      for (const [width,height] of [[1920,1080],[1280,800],[1024,768],[390,844]]) {
        await page.setViewportSize({width,height});
        await map("AC.UI02.PREVIEW.FIT").click();
        await graph(threeNodes,threeEdges,variant + ": responsive " + width + "x" + height);
        await page.waitForTimeout(300);
        await shot(variant,"responsive-canvas-"+width+"x"+height);
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
        assert(overflow<3,"Document overflow at "+width+": "+overflow);
        await map("AC.UI02.PREVIEW.PROJECTS").first().click();
        assert(await map("AC.UI02.PREVIEW.LIBRARY").isVisible(), "Library failed at " + width + "x" + height);
        await shot(variant,"responsive-library-"+width+"x"+height);
        await page.locator(".previewTopAction").click();
      }
      await page.setViewportSize({width:1440,height:900});
      await page.locator(".previewTopAction").click();
      const librarySearch = map("AC.UI02.PREVIEW.PROJECT.SEARCH");
      await librarySearch.fill("neon");
      assert(await page.locator(".previewProjectCard").count()===1, "Library search did not filter demo projects");
      await librarySearch.fill("");
      await page.getByRole("button",{name:"Tạo dự án mẫu"}).click();
      await page.locator(".previewDialog[open] input").fill("Dự án kiểm tra UI-02");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM").click();
      assert((await page.locator(".previewProjectGrid").innerText()).includes("Dự án kiểm tra UI-02"),"In-memory create failed");
      const project = page.locator(".previewProjectCard").filter({hasText:"Dự án kiểm tra UI-02"});
      await project.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
      await project.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RENAME"]').click();
      await page.locator(".previewDialog[open] input").fill("Dự án đã đổi tên UI-02");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM").click();
      const renamed = page.locator(".previewProjectCard").filter({hasText:"Dự án đã đổi tên UI-02"});
      assert(await renamed.count()===1, "In-memory project rename failed");
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE"]').click();
      assert(await page.locator(".previewDialog[open]").count()===1, "Project soft-delete confirmation missing");
      await map("AC.UI02.PREVIEW.DELETE.CONFIRM").click();
      assert(await renamed.count()===0, "Deleted project remains in active library");
      await map("AC.UI02.PREVIEW.PROJECT.TRASH").click();
      assert(await page.locator(".trashProject").filter({hasText:"Dự án đã đổi tên UI-02"}).count()===1, "Deleted demo project missing from trash");
      await page.locator(".trashProject").filter({hasText:"Dự án đã đổi tên UI-02"}).locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RESTORE"]').click();
      assert(await renamed.count()===1, "Demo project restore failed");
      await goto(variant,"screen=library");
      assert(await page.locator(".previewProjectCard").count()===3 && await page.getByText("Dự án đã đổi tên UI-02").count()===0,
        "Preview changes persisted across reload; expected in-memory only");
      assert(apiCalls.length===0, "Preview sent API call");
    }
    assert(errors.length===0,"JS errors: "+errors.join("; "));
    assert(shots.length>=56,"Expected 20 primary plus 8 responsive screenshots per variant; got " + shots.length);
    return {result:"PASS (technical preview QA only; visual approval by owner pending)",screenshots:shots,count:shots.length,apiCalls,errors,checks,edgeProbe,videoPlayback:"NOT TESTED (external CC0 streaming depends on network)"};
  } finally { page.off("pageerror",onError); page.off("request",onRequest); page.off("websocket",onSocket); }
}
