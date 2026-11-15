// UI-02 — Lệnh 5/5 final A/B review, DEV-only in-memory Vue preview.
// REUSE the already open Playwright CLI session (DO NOT open another browser):
// cd /kkk && npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-design-preview-qa.js
// Fresh screenshots overwrite only 01..24 + responsive-canvas/library-* in review-A/B.
async (page) => {
  const root = "docs/evidence/ui02/review-";
  const shots = [], errors = [], apiCalls = [], edgeProbe = [], checks = [], videoPlayback = [];
  let phase = "initialization", hmrSockets = 0;
  const onError = error => errors.push(error.message);
  const isApi = url => /\/(?:api|graphql|socket\.io|ws)(?:\/|$)/i.test(new URL(url).pathname);
  const onRequest = request => {
    if (isApi(request.url())) apiCalls.push({kind:"request",method:request.method(),url:request.url()});
  };
  page.on("pageerror", onError); page.on("request", onRequest);
  const assert = (pass, message) => { if (!pass) throw Error(message); };
  const initialUrl = new URL(page.url());
  assert(/^https?:$/.test(initialUrl.protocol) && /^(A|B)$/.test(initialUrl.searchParams.get("designPreview") || ""),
    "Open a DEV A/B preview tab in the EXISTING ui02shell2 Playwright session first");
  const origin = initialUrl.origin;
  const onSocket = socket => {
    const url = new URL(socket.url());
    if (url.host===initialUrl.host && url.pathname==="/") hmrSockets++;
    else apiCalls.push({kind:"websocket",url:socket.url()});
  };
  page.on("websocket", onSocket);
  const safe = () => {
    assert(errors.length===0,"Uncaught JavaScript pageerror: "+JSON.stringify(errors));
    assert(apiCalls.length===0,"App API/WebSocket call in DEV preview: "+JSON.stringify(apiCalls));
  };
  const threeNodes = ["preview-text-01", "preview-image-01", "preview-video-01"];
  const sevenNodes = [...threeNodes, "preview-text-02", "preview-image-02", "preview-image-03", "preview-video-02"];
  const threeEdges = ["preview-edge-01", "preview-edge-02", "preview-edge-03"];
  const sevenEdges = [...threeEdges, "preview-edge-04", "preview-edge-05"];
  const map = id => page.locator('[data-map-id="' + id + '"]');
  const shot = async (variant, name) => {
    const path = root + variant + "/" + name + ".png";
    await page.screenshot({ path, fullPage: false, animations: "disabled" });
    shots.push(path);
    assert(await page.evaluate(() => {
      const counts=new Map();
      for (const el of document.querySelectorAll("[id]")) counts.set(el.id,(counts.get(el.id)||0)+1);
      return [...counts.values()].every(n=>n===1);
    }),"Duplicate literal DOM IDs during screenshot "+path);
    safe();
  };
  const goto = async (variant, query) => {
    await page.goto(origin + "/?designPreview=" + variant + (query ? "&" + query : ""));
    await map("AC.UI02.PREVIEW.ROOT").waitFor({state:"visible"});
    assert(await map("AC.UI02.PREVIEW.MODE." + variant).getAttribute("aria-pressed") === "true", "Incorrect design mode " + variant);
    assert(await map("AC.UI02.PREVIEW.DEMO.STATUS").isVisible(),"DEV in-memory DEMO status badge missing");
    safe();
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
    const edgeBefore = await page.locator('.vue-flow__edge[data-id="preview-edge-01"] .vue-flow__edge-path').getAttribute("d");
    const x = header.x + 36, y = header.y + header.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 76, y + 42, {steps:18});
    await page.mouse.up();
    const after = await node.boundingBox();
    assert(after && Math.hypot(after.x-before.x, after.y-before.y) > 24,
      "Dragging the real Text node did not move its DOM bounding box");
    const edgeAfter = await page.locator('.vue-flow__edge[data-id="preview-edge-01"] .vue-flow__edge-path').getAttribute("d");
    assert(edgeBefore && edgeAfter && edgeBefore !== edgeAfter,
      "Connected SVG edge path did not follow the moved Text node");
    checks.push("real node drag preserves and updates Vue Flow SVG edge");
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
  const waitDialogClosed = async kind => {
    // Vue retains the actual HTML dialog top layer for 240ms after a confirm
    // to swallow the second native double-click instead of clicking the card below.
    await page.waitForFunction(type => {
      const h=document.querySelector(type==="project"?
        "#preview-project-dialog-title":"#preview-delete-title");
      const dialog=h?.closest("dialog");
      return dialog instanceof HTMLDialogElement && !dialog.open;
    },kind,{timeout:1200});
  };
  const dialog = kind => page.locator(kind==="project"?"#preview-project-dialog-title":"#preview-delete-title").locator("xpath=..");
  const assertDialog = async kind => {
    const modal=dialog(kind);
    assert(await modal.evaluate(el=>el instanceof HTMLDialogElement && el.open),
      kind+" native confirmation was not opened");
    assert(await modal.evaluate(el=>el.contains(document.activeElement)),
      kind+" confirmation did not keep focus inside native modal");
    return modal;
  };
  const verifyLibraryCovers = async () => {
    const covers=await page.locator(".previewProjectCard .projectPreviewCover").evaluateAll(elements=>elements.map(el=>{
      const img=el.querySelector("img"),box=el.getBoundingClientRect();
      return {id:el.getAttribute("data-preview-project-id"),src:img?.currentSrc,
        naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,
        complete:img?.complete,fit:img?getComputedStyle(img).objectFit:null,
        ratio:box.width/box.height};
    }));
    assert(covers.length===3 && new Set(covers.map(c=>c.id)).size===3 && new Set(covers.map(c=>c.src)).size===3,
      "Project Library must have three distinct SVG cards with stable unique IDs");
    assert(covers.every(c=>c.complete && c.naturalWidth>0 && c.naturalHeight>0 &&
      c.src.includes("/designPreview/") && c.src.endsWith(".svg") &&
      c.fit==="cover" && Math.abs(c.ratio-1.6)<.035),
      "Library cards do not have loaded unique SVG posters / 16:10 cover frames: "+JSON.stringify(covers));
    checks.push("Library three distinct natural SVG covers and 16:10 compact project cards");
  };
  const verifyDemoImage = async id => {
    const media=page.locator('[data-preview-node="'+id+'"] .previewImageMedia');
    const frame=await media.evaluate(el=>{
      const img=el.querySelector("img"),b=el.getBoundingClientRect();
      return {sourceAspect:el.getAttribute("data-aspect"),ratio:b.width/b.height,
        naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,
        fit:img?getComputedStyle(img).objectFit:null,src:img?.currentSrc};
    });
    const expected={"preview-image-01":16/9,"preview-image-02":9/16,"preview-image-03":1};
    assert(frame.fit==="contain" && frame.naturalWidth===760 && frame.naturalHeight===470 &&
      Math.abs(frame.ratio-expected[id])<.035 &&
      frame.sourceAspect==={"preview-image-01":"16:9","preview-image-02":"9:16","preview-image-03":"1:1"}[id],
      "Image source aspect ratio, natural SVG dimensions or contain-fit incorrect: "+JSON.stringify(frame));
    checks.push("real local SVG Image DEMO aspectRatio "+frame.sourceAspect+" and object-fit contain");
  };
  const testImageDialog = async () => {
    const image=page.locator('[data-preview-node="preview-image-01"]');
    await image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.OPEN"]').click();
    const popup=image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.DIALOG"]');
    assert(await popup.evaluate(el=>el instanceof HTMLDialogElement && el.open),
      "Image Open button did not show real native DEMO preview");
    assert(await popup.locator("img").evaluate(el=>el.complete && el.naturalWidth>0),
      "Image popup content was not decoded");
    await popup.locator('[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.CLOSE"]').click();
    assert(!await popup.evaluate(el=>el.open),"Image preview Close button failed");
    checks.push("Image DEMO Open/Close native dialog displays actual decoded poster");
  };
  const testVideoPlayback = async variant => {
    const player=page.locator('[data-preview-node="preview-video-01"] video');
    const result=await player.evaluate(async video=>{
      const src=video.currentSrc||video.src,poster=video.getAttribute("poster");
      const container=video.closest(".previewMedia"),r=container?.getBoundingClientRect();
      const info={src,poster,controls:video.controls,playsInline:video.playsInline,
        objectFit:getComputedStyle(video).objectFit,frameRatio:r?.width/r?.height,
        readyState:video.readyState};
      const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      let error="",played=false,timeStart=video.currentTime,timeEnd=video.currentTime,paused=false;
      try {
        await Promise.race([video.play(),new Promise((_,reject)=>
          setTimeout(()=>reject(Error("HTML5 local CC0 play timeout")),4000))]);
        played=!video.paused;
        timeStart=video.currentTime;
        await wait(1150);
        timeEnd=video.currentTime;
      } catch(e) { error=String(e?.message||e); }
      finally { video.pause(); paused=video.paused; }
      return {...info,error,played,timeStart,timeEnd,paused,advanced:timeEnd>timeStart+.06};
    });
    result.variant=variant;
    videoPlayback.push(result);
    assert(result.src.endsWith("/designPreview/flower-cc0.webm") &&
      result.poster?.endsWith("/designPreview/flowerFrame.svg") &&
      result.controls && result.playsInline && result.objectFit==="contain" &&
      Math.abs(result.frameRatio-16/9)<.035,
      "Local CC0 video source/poster/16:9/native controls incorrect: "+JSON.stringify(result));
    assert(!result.error && result.played && result.advanced && result.paused,
      "HTML5 Video Play/Pause is NOT a genuine PASS: "+JSON.stringify(result));
    checks.push(variant+": real local HTML5 Video Play/Pause and currentTime advanced");
  };
  const addRealConnection = async () => {
    // On 7 seeded nodes + an added Image, Text02 -> added Image is a VALID,
    // nonseeded connection; click the actual Vue Flow source/target handles.
    const src=page.locator('[data-preview-node="preview-text-02"] .vue-flow__handle-right');
    const dst=page.locator('[data-preview-node="preview-image-added-8"] .vue-flow__handle-left');
    assert(await src.isVisible() && await dst.isVisible(),"Real connection handle unavailable");
    await map("AC.UI02.PREVIEW.FIT").click();
    await page.waitForTimeout(300);
    const original=await page.locator(".vue-flow__edge").evaluateAll(els=>els.map(e=>e.getAttribute("data-id")));
    assert(original.length===5,"Connection precondition expects 5 seeded SVG edges");
    await src.click({timeout:3500});
    await dst.click({timeout:3500});
    await page.waitForFunction(before=>{
      const edges=[...document.querySelectorAll(".vue-flow__edge")];
      return edges.length===before.length+1 &&
        edges.every(e=>!!e.querySelector(".vue-flow__edge-path")?.getAttribute("d")?.startsWith("M")) &&
        edges.filter(e=>!before.includes(e.getAttribute("data-id"))).length===1;
    },original,{timeout:5000});
    const now=await page.locator(".vue-flow__edge").evaluateAll(els=>els.map(e=>e.getAttribute("data-id")));
    const inserted=now.find(id=>!original.includes(id));
    assert(now.length===6 && new Set(now).size===6 && inserted,
      "Valid user connection failed to insert exactly one new unique SVG edge");
    await src.click({timeout:3500});
    await dst.click({timeout:3500});
    await page.waitForTimeout(150);
    const afterDuplicate=await page.locator(".vue-flow__edge").evaluateAll(els=>els.map(e=>e.getAttribute("data-id")));
    assert(afterDuplicate.length===6 && new Set(afterDuplicate).size===6,
      "Duplicate user connection was incorrectly accepted");
    checks.push("real handle-to-handle connect creates valid edge; duplicate remains blocked");
    return inserted;
  };
  const checkStatus = async (value,label) => {
    await map("AC.UI02.PREVIEW.STATUS").selectOption(value);
    const alert=map("AC.UI02.PREVIEW.SIMULATED.STATUS");
    await alert.waitFor({state:"visible"});
    const text=(await alert.innerText()).toLocaleLowerCase("vi-VN");
    assert(text.includes(label.toLocaleLowerCase("vi-VN")) &&
      text.includes("trạng thái demo") && text.includes("không gọi api"),
      "DEMO "+value+" status not properly labeled or falsely implies real API: "+text);
    assert(await map("AC.UI02.PREVIEW.DEMO.STATUS").isVisible(),
      "Header DEMO badge missing while "+value+" status selected");
    checks.push("real status selection: "+value+" (DEMO only)");
  };
  try {
    for (const variant of ["A","B"]) {
      phase=variant+": library and seed project cards";
      await page.setViewportSize({width:1440,height:900});
      await goto(variant, "screen=library");
      assert(await map("AC.UI02.PREVIEW.LIBRARY").isVisible(), variant + ": library not visible");
      assert(await page.locator(".previewProjectCard").count() === 3, variant + ": 3 distinct project demo cards expected");
      await verifyLibraryCovers();
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
      await map("AC.UI02.PREVIEW.EMPTY").locator('[data-map-id="AC.UI02.PREVIEW.ADD"]').click();
      await map("AC.UI02.PREVIEW.PALETTE").waitFor({state:"visible"});
      await map("AC.UI02.PREVIEW.PALETTE.CLOSE").click();
      assert(await map("AC.UI02.PREVIEW.PALETTE").count()===0,
        "Canvas Empty Add/Palette Close buttons did not perform real actions");
      phase=variant+": 3-node Text/Image/Video";
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await graph(threeNodes,threeEdges,variant + ": 3-node workflow");
      await map("AC.UI02.PREVIEW.MEDIA").selectOption("compact");
      await graph(threeNodes,threeEdges,variant + ": compact media");
      assert(await page.locator(".previewMedia").count()===0, "Compact state falsely contains media");
      assert(await page.locator(".previewMediaUnavailable").count()===2, "Compact media must explain AI is disconnected on Image and Video");
      await selectNode("preview-text-01");
      const textEditor=page.locator('[data-preview-node="preview-text-01"] [data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT"]');
      const editedText=(await textEditor.inputValue())+" — final QA";
      await textEditor.fill(editedText);
      assert(await textEditor.inputValue()===editedText,"Text Node prompt is not genuinely editable");
      const textExpand=page.locator('[data-preview-node="preview-text-01"] [data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND"]');
      await textExpand.click();
      assert(await textExpand.getAttribute("aria-expanded")==="true","Text expand did not work");
      await textExpand.click();
      assert(await textExpand.getAttribute("aria-expanded")==="false" && await textEditor.inputValue()===editedText,
        "Text collapse lost edited note");
      await shot(variant,"04-text-node");
      await selectNode("preview-image-01");
      assert(await textEditor.inputValue()===editedText,"Selecting Image lost earlier Text prompt");
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
      await verifyDemoImage("preview-image-01");
      await shot(variant,"07-image-node-with-demo-media");
      await testImageDialog();
      await selectNode("preview-video-01");
      assert(await page.locator("video[controls]").count()===1 && await page.locator("video[controls]").getAttribute("src") !== null, "Native DEMO video controls/source missing");
      await testVideoPlayback(variant);
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
      for (const id of ["preview-image-01","preview-image-02","preview-image-03"]) await verifyDemoImage(id);
      await shot(variant,"10-seven-nodes-workflow");
      const image = await selectNode("preview-image-01");
      await shot(variant,"11-node-selected");
      assert(await map("AC.UI02.PREVIEW.NODE.TOOLBAR").count()===1,"Context toolbar missing");
      await shot(variant,"12-node-context-toolbar");
      await image.locator(".nodeMore").click();
      assert(await image.locator(".previewNodeMenu").isVisible(),"Node menu missing");
      assert(await image.locator('.previewNodeMenu [role="menuitem"]').count()===3,
        "Node menu must have real Edit/Inspector/Delete actions");
      await shot(variant,"13-node-menu");
      await image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
      await assertDialog("delete");
      await map("AC.UI02.PREVIEW.DELETE.CANCEL").click();
      assert(!await dialog("delete").evaluate(el=>el.open),"Delete Cancel did not close native dialog");
      await graph(sevenNodes,sevenEdges,variant + ": cancel delete preserves graph");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      phase=variant+": Palette and valid connection";
      await map("AC.UI02.PREVIEW.TOOLBAR").locator(".previewCreateButton").click();
      const search = map("AC.UI02.PREVIEW.PALETTE").locator("input[type=search]");
      assert(await search.evaluate(el=>document.activeElement===el),
        "Opening Node Palette did not focus its search");
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
      const connectedEdgeId=await addRealConnection();
      await graph([...sevenNodes,"preview-image-added-8"],[...sevenEdges,connectedEdgeId],
        variant + ": real newly connected edge");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await graph(threeNodes,threeEdges,variant + ": reset after palette addition (three)");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("seven");
      await graph(sevenNodes,sevenEdges,variant + ": reset after palette addition");
      await selectNode("preview-video-01");
      await map("AC.UI02.PREVIEW.INSPECTOR.PROMPT").fill("Dolly camera 35mm, ánh sáng ven đường, cảnh đêm.");
      assert((await page.locator('[data-preview-node="preview-video-01"] .previewPromptSummary').innerText()).includes("Dolly"),"Prompt desynchronized");
      await shot(variant,"15-inspector-open");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      assert(await map("AC.UI02.PREVIEW.INSPECTOR").count()===0 &&
        (await page.locator('[data-preview-node="preview-video-01"]').getAttribute("class")).includes("selected"),
        "Closing Inspector did not remove panel or lost selected node");
      await shot(variant,"16-inspector-closed");
      const imageAgain = await selectNode("preview-image-01");
      const longPrompt = "Ánh sáng điện ảnh và chuyển động máy quay. ".repeat(24);
      await map("AC.UI02.PREVIEW.INSPECTOR.PROMPT").fill(longPrompt);
      await imageAgain.locator(".previewExpand").click();
      assert((await imageAgain.locator("textarea").inputValue())===longPrompt,"Long prompt lost");
      await imageAgain.locator(".previewExpand").click();
      assert((await imageAgain.locator(".previewPromptSummary").getAttribute("title"))===longPrompt,
        "Long media prompt lost after collapse");
      await imageAgain.locator('[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EDIT"]').click();
      const longEditor=imageAgain.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT"]');
      assert(await longEditor.evaluate(el=>document.activeElement===el) &&
        await longEditor.inputValue()===longPrompt,"Reopening long media prompt lost focus/content");
      // .fill() leaves the caret at the end and may auto-scroll to the bottom.
      // Reset to the top so a real downward wheel must visibly scroll the editor.
      const beforeWheel=await longEditor.evaluate(el=>{
        el.scrollTop=0;
        return {scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
      });
      assert(beforeWheel.scrollHeight>beforeWheel.clientHeight+20,
        "Long prompt textarea is not sufficiently scrollable: "+JSON.stringify(beforeWheel));
      assert(beforeWheel.scrollTop<=2,
        "Could not reset long prompt textarea to top before real wheel: "+JSON.stringify(beforeWheel));
      const zoomBeforeWheel=await zoomNumber();
      await longEditor.hover();
      await page.mouse.wheel(0,300);
      await page.waitForTimeout(130);
      assert(await longEditor.evaluate(el=>el.scrollTop)>beforeWheel.scrollTop+10,
        "Wheel did not scroll the long prompt textarea");
      assert(Math.abs(await zoomNumber()-zoomBeforeWheel)<1,
        "Scrolling node prompt unexpectedly zoomed Canvas");
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
      phase=variant+": seven DEMO status options";
      for (const [value,label] of [["empty","Empty"],["loading","Loading"],["saved","Saved"],["unsaved","Unsaved"]]) {
        await checkStatus(value,label);
        await map("AC.UI02.PREVIEW.STATUS.DISMISS").click();
        assert(await map("AC.UI02.PREVIEW.SIMULATED.STATUS").count()===0 &&
          await map("AC.UI02.PREVIEW.STATUS").inputValue()==="normal",
          "Dismiss did not return "+value+" to normal");
      }
      await checkStatus("offline","Offline");
      await shot(variant,"24-offline-demo");
      await checkStatus("save503","Error 503");
      await shot(variant,"19-save-error");
      await checkStatus("conflict409","Conflict 409");
      await shot(variant,"20-revision-conflict");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("normal");
      assert(await map("AC.UI02.PREVIEW.SIMULATED.STATUS").count()===0, "Preview error state did not clear");
      phase=variant+": real node delete Confirm";
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await map("AC.UI02.PREVIEW.FIT").click();
      await page.waitForTimeout(300);
      const deleteText=await selectNode("preview-text-02");
      await deleteText.locator(".nodeMore").click();
      await deleteText.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
      await assertDialog("delete");
      await map("AC.UI02.PREVIEW.DELETE.CONFIRM").click();
      await waitDialogClosed("delete");
      await graph(sevenNodes.filter(id=>id!=="preview-text-02"),sevenEdges.filter(id=>id!=="preview-edge-04"),
        variant+": Confirm Delete removes only Text02 and incident edge");
      checks.push("native node delete confirmation removes exactly target and incident edges, no ghost");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await graph(threeNodes,threeEdges,variant + ": reset responsive state");
      phase=variant+": five responsive viewport Canvas/Library pairs";
      for (const [width,height] of [[1920,1080],[1440,900],[1280,800],[1024,768],[390,844]]) {
        await page.setViewportSize({width,height});
        await map("AC.UI02.PREVIEW.FIT").click();
        await graph(threeNodes,threeEdges,variant + ": responsive " + width + "x" + height);
        await page.waitForTimeout(300);
        await shot(variant,"responsive-canvas-"+width+"x"+height);
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
        assert(overflow<3,"Responsive Canvas document overflow at "+width+": "+overflow);
        if (width===390) {
          const selected=page.locator('.vue-flow__node[data-id="preview-image-01"]');
          const graphPos=()=>selected.evaluate(el=>{
            const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);
            return {x:m.m41,y:m.m42};
          });
          const nodeBefore=await graphPos();
          if (variant==="B") {
            await page.locator('.sceneRailItem[data-preview-node-id="preview-image-01"]').click();
          } else {
            await selectNode("preview-image-01");
          }
          const inspector=map("AC.UI02.PREVIEW.INSPECTOR");
          await inspector.waitFor({state:"visible"});
          await page.waitForTimeout(220);
          const nodeAfter=await graphPos(),ib=await inspector.boundingBox(),
            stage=await map("AC.UI02.PREVIEW.STAGE").boundingBox();
          assert(ib && stage && Math.hypot(nodeBefore.x-nodeAfter.x,nodeBefore.y-nodeAfter.y)<.5,
            "390px Inspector changed saved node position or has no measurable geometry");
          if (variant==="B") {
            const position=await inspector.evaluate(el=>getComputedStyle(el).position);
            assert(position!=="absolute" && ib.y>=stage.y+stage.height-3,
              "B mobile Inspector must dock BELOW clickable Canvas, not overlap it");
          } else {
            assert(ib.width>=250 && ib.width<=325,
              "A mobile Inspector expected compact floating width, got "+ib.width);
          }
          await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
          assert(await inspector.count()===0,"390px Inspector Close left overlay/dock visible");
          checks.push(variant+": mobile Inspector geometry, graph position and close action");
          await map("AC.UI02.PREVIEW.FIT").click();
          await page.waitForTimeout(280);
        }
        // Real Palette control must remain focusable and contained within both
        // stage and viewport. Test at all five sizes, including 390px mobile.
        const tBefore=await page.locator(".vue-flow__transformationpane").evaluate(el=>{
          const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);
          return {x:m.m41,y:m.m42,z:m.a};
        });
        await map("AC.UI02.PREVIEW.TOOLBAR").locator(".previewCreateButton").click();
        const popup=map("AC.UI02.PREVIEW.PALETTE");
        await popup.waitFor({state:"visible"});
        const input=popup.locator('[data-map-id="AC.UI02.PREVIEW.PALETTE.SEARCH"]');
        assert(await input.evaluate(el=>document.activeElement===el),
          width+": Palette keyboard search was not focused");
        const paletteRect=await popup.boundingBox(),stageRect=await map("AC.UI02.PREVIEW.STAGE").boundingBox();
        assert(paletteRect && stageRect && paletteRect.x>=stageRect.x-3 &&
          paletteRect.y>=stageRect.y-3 &&
          paletteRect.x+paletteRect.width<=stageRect.x+stageRect.width+3 &&
          paletteRect.y+paletteRect.height<=stageRect.y+stageRect.height+3 &&
          paletteRect.x>=-2 && paletteRect.y>=-2 &&
          paletteRect.x+paletteRect.width<=width+2 && paletteRect.y+paletteRect.height<=height+2,
          "Responsive Palette escaped stage or viewport at "+width+": "+
          JSON.stringify({paletteRect,stageRect}));
        await input.fill("hình");
        assert(await popup.count()===1 && await map("AC.UI02.PREVIEW.ADD.IMAGE").count()===1 &&
          await map("AC.UI02.PREVIEW.ADD.TEXT").count()===0 &&
          await map("AC.UI02.PREVIEW.ADD.VIDEO").count()===0,
          width+": Palette search closed early or filtering was wrong");
        const tAfter=await page.locator(".vue-flow__transformationpane").evaluate(el=>{
          const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);
          return {x:m.m41,y:m.m42,z:m.a};
        });
        assert(Math.hypot(tAfter.x-tBefore.x,tAfter.y-tBefore.y)<.7 &&
          Math.abs(tAfter.z-tBefore.z)<.001,
          width+": Opening/typing in Palette wrongly pan/zoomed Canvas");
        await input.press("Escape");
        assert(await popup.count()===0,width+": Palette Escape did not close");
        checks.push(variant+": "+width+"x"+height+" responsive Palette focus/search/containment/no pan");
        await map("AC.UI02.PREVIEW.PROJECTS").first().click();
        assert(await map("AC.UI02.PREVIEW.LIBRARY").isVisible(), "Library failed at " + width + "x" + height);
        await shot(variant,"responsive-library-"+width+"x"+height);
        const libraryOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
        assert(libraryOverflow<3,"Responsive Library document overflow at "+width+": "+libraryOverflow);
        assert(await page.locator(".previewProjectCard").count()===3,
          "Library responsive preview lost seeded projects");
        const gridCols=await page.locator(".previewProjectGrid").evaluate(el=>
          getComputedStyle(el).gridTemplateColumns.split(" ").length);
        assert(width===390?gridCols===1:gridCols>=2,
          "Library responsive grid does not fit viewport "+width+" columns="+gridCols);
        await page.locator(".previewTopAction").click();
      }
      await page.setViewportSize({width:1440,height:900});
      await page.locator(".previewTopAction").click();
      phase=variant+": real Project Library CRUD/dialogs";
      await verifyLibraryCovers();
      const librarySearch = map("AC.UI02.PREVIEW.PROJECT.SEARCH");
      await librarySearch.fill("neon");
      assert(await page.locator(".previewProjectCard").count()===1, "Library search did not filter demo projects");
      await librarySearch.fill("");
      const seed=page.locator(".previewProjectCard").first();
      await seed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
      assert(await seed.locator('.projectMoreMenu [role="menuitem"]').count()===3,
        "Project Card menu no longer exposes three real actions: Open/Rename/DeleteSoft");
      await seed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU.OPEN"]').click();
      assert(await map("AC.UI02.PREVIEW.STAGE").isVisible(),"Project menu Open did not return to Canvas");
      await graph(threeNodes,threeEdges,variant+": Open project from card menu");
      await map("AC.UI02.PREVIEW.HOME").click();
      assert(await map("AC.UI02.PREVIEW.LIBRARY").isVisible(),"Header Home did not reopen library");
      const createButton=page.locator(".previewLibraryHeader").locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.NEW"]');
      await createButton.click();
      await assertDialog("project");
      assert(await map("AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM").isDisabled(),
        "Empty project name incorrectly enables Create");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.NAME").fill("Dự án hủy UI-02");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.CANCEL").click();
      assert(!await dialog("project").evaluate(el=>el.open) &&
        await page.locator(".previewProjectCard").count()===3,
        "Cancel Create left dialog open or created ghost card");
      await createButton.click();
      await assertDialog("project");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.NAME").fill("Dự án ESC UI-02");
      await page.keyboard.press("Escape");
      assert(!await dialog("project").evaluate(el=>el.open) &&
        await page.locator(".previewProjectCard").count()===3,
        "Native Escape did not close Create or caused ghost project");
      await createButton.click();
      await assertDialog("project");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.NAME").fill("Dự án kiểm tra UI-02");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM").dblclick({delay:45});
      await waitDialogClosed("project");
      assert(await page.locator(".previewProjectCard").count()===4,
        "Create double-click added duplicate project or activated underlying card");
      const project = page.locator(".previewProjectCard").filter({hasText:"Dự án kiểm tra UI-02"});
      assert(await project.count()===1,"In-memory Create failed or double-submitted");
      const id=await project.locator(".projectPreviewCover").getAttribute("data-preview-project-id");
      assert(!!id,"Created project has no stable in-memory ID");
      await project.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
      await project.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RENAME"]').click();
      await assertDialog("project");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.NAME").fill("Dự án đã đổi tên UI-02");
      await map("AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM").click();
      await waitDialogClosed("project");
      const renamed=page.locator(".previewProjectCard").filter({has:
        page.locator('.projectPreviewCover[data-preview-project-id="'+id+'"]')});
      assert(await renamed.count()===1 && (await renamed.innerText()).includes("Dự án đã đổi tên UI-02") &&
        await page.locator(".previewProjectCard").count()===4,
        "In-memory Rename failed to preserve project ID or duplicated card");
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE"]').click();
      await assertDialog("delete");
      await map("AC.UI02.PREVIEW.DELETE.CANCEL").click();
      assert(!await dialog("delete").evaluate(el=>el.open) && await renamed.count()===1,
        "Cancel Soft Delete removed card or left native dialog open");
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE"]').click();
      await assertDialog("delete");
      await map("AC.UI02.PREVIEW.DELETE.CONFIRM").click();
      await waitDialogClosed("delete");
      assert(await renamed.count()===0 && await page.locator(".previewProjectCard").count()===3,
        "Confirmed Soft Delete did not remove exactly the project");
      if (await map("AC.UI02.PREVIEW.PROJECT.TRASH").getAttribute("aria-expanded")==="false") {
        await map("AC.UI02.PREVIEW.PROJECT.TRASH").click();
      }
      assert(await map("AC.UI02.PREVIEW.PROJECT.TRASH").getAttribute("aria-expanded")==="true",
        "Project Trash did not open after Soft Delete");
      const trash=page.locator(".trashProject").filter({hasText:"Dự án đã đổi tên UI-02"});
      assert(await trash.count()===1,"Soft-deleted project missing in Trash");
      await trash.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RESTORE"]').click();
      assert(await renamed.count()===1 && await page.locator(".previewProjectCard").count()===4,
        "Restoring project did not retain stable ID or count");
      await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.OPEN"]').first().click();
      assert(await map("AC.UI02.PREVIEW.STAGE").isVisible(),"Project Card Open did not navigate to Canvas");
      await graph(threeNodes,threeEdges,variant+": restored project Open");
      checks.push("Library project menu/card Open, native Create/Cancel/Escape/double-submit, Rename, SoftDelete/Cancel/Confirm, auto Trash, Restore and stable ID");
      await goto(variant,"screen=library");
      assert(await page.locator(".previewProjectCard").count()===3 && await page.getByText("Dự án đã đổi tên UI-02").count()===0,
        "Preview changes persisted across reload; expected in-memory only");
      safe();
    }
    safe();
    const primaryNames=[
      "01-project-library","02-project-library-empty","03-canvas-empty",
      "04-text-node","05-image-node-compact","06-video-node-compact",
      "07-image-node-with-demo-media","08-video-node-with-demo-media",
      "09-three-nodes-connected","10-seven-nodes-workflow","11-node-selected",
      "12-node-context-toolbar","13-node-menu","14-node-palette",
      "15-inspector-open","16-inspector-closed","17-long-prompt",
      "18-right-edge-node-selected","19-save-error","20-revision-conflict",
    ];
    const extraNames=["21-node-dragged","22-canvas-panned","23-canvas-fitted","24-offline-demo"];
    const viewports=[[1920,1080],[1440,900],[1280,800],[1024,768],[390,844]];
    const expected=[];
    for (const variant of ["A","B"]) {
      for (const name of [...primaryNames,...extraNames]) expected.push(root+variant+"/"+name+".png");
      for (const [w,h] of viewports) {
        expected.push(root+variant+"/responsive-canvas-"+w+"x"+h+".png");
        expected.push(root+variant+"/responsive-library-"+w+"x"+h+".png");
      }
    }
    assert(expected.length===68 && shots.length===68 && new Set(shots).size===68 &&
      expected.every(path=>shots.includes(path)),
      "Final A/B screenshot coverage must be EXACTLY 01–20 + 21–24 + five Canvas/Library viewport pairs each, 68 distinct files. Actual "+shots.length);
    assert(videoPlayback.length===2 && ["A","B"].every(variant=>videoPlayback.some(v=>
      v.variant===variant && v.played && v.advanced && v.paused && !v.error)),
      "Local CC0 video playback must be actually measured and pass in both A and B: "+JSON.stringify(videoPlayback));
    return {
      result:"PASS — TECHNICAL DEV PREVIEW ONLY; VISUAL APPROVAL PENDING OWNER",
      screenshots:shots,count:shots.length,primaryPerVariant:20,extraPerVariant:4,
      responsivePerVariant:10,viewports,apiCalls,errors,hmrSockets,
      checks,edgeProbe,videoPlayback,
      projectPersistence:"DEMO in-memory only; reload cleared changes",
      networkEvidence:"0 application API/WebSocket requests (Vite HMR socket excluded)",
      sqliteEvidence:"No application API invoked; direct SQLite files were not inspected by this browser-only test",
    };
  } catch (error) {
    throw Error("UI-02 FINAL QA FAILED at "+phase+", "+shots.length+
      "/68 fresh screenshots written: "+(error?.message||String(error)));
  } finally { page.off("pageerror",onError); page.off("request",onRequest); page.off("websocket",onSocket); }
}
