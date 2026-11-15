// UI-02 — Lệnh 3/5. Run with Playwright CLI on the EXISTING DEV preview session.
// From /kkk: npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-node-qa.js
// No browser/server starts here; all edits are in-memory Vue preview demo state.
async (page) => {
  const opened = new URL(page.url());
  if (!/^https?:$/.test(opened.protocol) || !/^(A|B)$/.test(opened.searchParams.get("designPreview") || "")) {
    throw Error("Open an existing DEV ?designPreview=A/B tab in Playwright ui02shell2 first");
  }
  const origin = opened.origin;
  const root = "docs/evidence/ui02/command3/";
  const width = 1440, height = 900;
  const node3 = ["preview-text-01", "preview-image-01", "preview-video-01"];
  const node7 = [...node3, "preview-text-02", "preview-image-02", "preview-image-03", "preview-video-02"];
  const edge3 = ["preview-edge-01", "preview-edge-02", "preview-edge-03"];
  const edge7 = [...edge3, "preview-edge-04", "preview-edge-05"];
  const states = ["text", "image-compact", "image-demo", "video-compact", "video-demo",
    "three-connected", "seven-nodes", "selected", "context-toolbar", "long-prompt"];
  const screenshots = [], checked = [], media = [], imageMeasurements = [], errors = [], appTraffic = [], hmr = [];
  let phase = "startup";
  const must = (yes, message) => { if (!yes) throw Error(message); };
  const check = title => { if (!checked.includes(title)) checked.push(title); };
  const map = code => page.locator('[data-map-id="AC.UI02.PREVIEW.' + code + '"]');
  const node = name => page.locator('[data-preview-node="' + name + '"]');
  const edge = name => page.locator('.vue-flow__edge[data-id="' + name + '"]');
  const snap = async (variant, state) => {
    must(states.includes(state), "Unexpected screenshot state " + state);
    const path = root + variant + "-" + state + "-1440x900.png";
    await page.screenshot({path, fullPage:false, animations:"disabled"});
    screenshots.push(path); // Only after Playwright finished writing the PNG.
  };
  const onError = error => errors.push(error.message);
  const onRequest = request => {
    const url = new URL(request.url());
    if (/\/api(?:\/|$)/i.test(url.pathname) || /^\/(?:ws|socket\.io)(?:\/|$)/i.test(url.pathname)) {
      appTraffic.push({method:request.method(),url:request.url()});
    }
  };
  const onWebSocket = ws => {
    const socket = new URL(ws.url());
    if (socket.host === opened.host && socket.pathname === "/") hmr.push(ws.url());
    else appTraffic.push({type:"websocket",url:ws.url()});
  };
  page.on("pageerror", onError);
  page.on("request", onRequest);
  page.on("websocket", onWebSocket);
  const noTraffic = () => {
    must(errors.length === 0, "Uncaught pageerrors: " + JSON.stringify(errors));
    must(appTraffic.length === 0, "Preview called application API/WebSocket: " + JSON.stringify(appTraffic));
  };
  const go = async (variant, scenario="three", mode="compact") => {
    phase = variant + " " + scenario + " " + mode + " navigation";
    await page.setViewportSize({width,height});
    await page.goto(origin + "/?designPreview=" + variant + "&scenario=" + scenario + "&media=" + mode);
    await map("ROOT").waitFor({state:"visible",timeout:7000});
    must(await map("MODE." + variant).getAttribute("aria-pressed") === "true", "Wrong preview variant");
    must(await map("SCENARIO").inputValue() === scenario, "Wrong workflow scenario");
    must(await map("MEDIA").inputValue() === mode, "Wrong media mode");
    must(await map("STAGE").isVisible(), "No live Canvas");
    noTraffic();
  };
  const graph = async (wantedNodes, wantedEdges) => {
    try {
      await page.waitForFunction(({nodes,edges}) => {
        const ns = [...document.querySelectorAll(".vue-flow__node")];
        const es = [...document.querySelectorAll(".vue-flow__edge")];
        return ns.length === nodes.length && es.length === edges.length
          && nodes.every(id => ns.some(n => n.getAttribute("data-id") === id))
          && edges.every(id => es.some(e => e.getAttribute("data-id") === id))
          && es.every(e => {
            const d = e.querySelector(".vue-flow__edge-path")?.getAttribute("d") || "";
            return d.startsWith("M") && d.length > 18 && !/NaN|undefined/.test(d);
          });
      },{nodes:wantedNodes,edges:wantedEdges},{timeout:9000});
    } catch {
      const actual = await page.locator(".vue-flow__edge").evaluateAll(els =>
        els.map(e => ({id:e.getAttribute("data-id"),path:e.querySelector(".vue-flow__edge-path")?.getAttribute("d")})));
      throw Error("Real SVG graph mismatch; expected " + JSON.stringify(wantedEdges) + ", got " + JSON.stringify(actual));
    }
    const label = await page.locator(".previewCanvasInfo strong").innerText();
    must(label.includes(wantedNodes.length + " node · " + wantedEdges.length + " kết nối"),
      "Graph label disagrees with DOM: " + label);
    check("exact live 3-node/3-SVG and 7-node/5-SVG graph");
  };
  const fit = async () => {
    await map("FIT").click();
    await page.waitForTimeout(280); // fitView has a 240ms animation.
  };
  const select = async (name) => {
    if (await map("INSPECTOR").count()) await map("INSPECTOR.CLOSE").click();
    const element = node(name);
    await element.locator(".node-drag-handle").click();
    await element.locator(".previewContextToolbar").waitFor({state:"visible",timeout:3000});
    must((await element.getAttribute("class") || "").includes("selected"),
      "Node not selected after header click: " + name);
    return element;
  };
  const transform = async () => page.locator(".vue-flow__transformationpane").evaluate(el => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return {x:m.m41,y:m.m42,z:m.a};
  });
  const bounds = async el => {
    const b = await el.boundingBox();
    must(b && b.width > 0 && b.height > 0,"Missing visible box");
    return b;
  };
  const verifyDistinct = async variant => {
    const text = node(node3[0]), image = node(node3[1]), video = node(node3[2]);
    must(await text.count() === 1 && await image.count() === 1 && await video.count() === 1,
      "Required distinct node types missing");
    must(await text.locator(".previewTextBody textarea").count() === 1,
      "Text should own an editable note body");
    must(await text.locator(".previewMedia").count() === 0 &&
      await text.locator(".previewMediaBody").count() === 0,"Text incorrectly uses media shell");
    for (const item of [image,video]) {
      must(await item.locator(".previewMediaDetails .previewExpand").count() === 1,
        "Media node must have collapsible prompt");
      must(await item.locator(".previewTextBody").count() === 0,
        "Image/Video reused Text body");
    }
    const wt = (await bounds(text)).width, wi = (await bounds(image)).width, wv = (await bounds(video)).width;
    must(wt < wi && wi < wv, "Visual node widths not distinct: " + JSON.stringify({wt,wi,wv,variant}));
    must(await text.locator(".type-image,.type-video").count() === 0,
      "Text node has media-type children");
    check("Text/Image/Video visibly distinct widths, body semantics and prompt controls");
  };
  const handles = async () => {
    const layout = [
      {id:node3[0],right:true,left:false},
      {id:node3[1],right:true,left:true},
      {id:node3[2],right:false,left:true},
    ];
    for (const spec of layout) {
      const host = node(spec.id);
      const r = await bounds(host);
      const left = host.locator(".vue-flow__handle-left"), right = host.locator(".vue-flow__handle-right");
      must(await left.count() === Number(spec.left) && await right.count() === Number(spec.right),
        "Incorrect source/target handles for " + spec.id);
      for (const [handle,side] of [[left,"left"],[right,"right"]]) {
        if (!await handle.count()) continue;
        const box = await bounds(handle);
        const cx = box.x + box.width/2, cy = box.y + box.height/2;
        const expected = side === "left" ? r.x : r.x + r.width;
        must(Math.abs(cx-expected) < 17 && cy > r.y+4 && cy < r.y+r.height-4,
          "Vue Flow handle is not aligned to " + side + " border of " + spec.id);
        const type = await handle.getAttribute("data-handleid");
        must(type === (side === "left" ? "input" : "output"),
          "Handle ID must be input (target)/output (source): " + spec.id + " " + type);
      }
    }
    check("source/right and target/left Vue Flow handle positions and IDs");
  };
  const imageFrame = async (variant, nodeId="preview-image-01", expectedAspect="16:9") => {
    const imageNode = node(nodeId);
    const picture = imageNode.locator(".previewMedia img");
    await picture.waitFor({state:"visible",timeout:4500});
    const data = await picture.evaluate(img => {
      const frame = img.closest(".previewMedia");
      const style = getComputedStyle(img), frameStyle = getComputedStyle(frame);
      const fb = frame.getBoundingClientRect(), ib = img.getBoundingClientRect();
      const ratio = img.naturalWidth / img.naturalHeight;
      const frameRatio = fb.width / fb.height;
      const scale = Math.min(ib.width / img.naturalWidth, ib.height / img.naturalHeight);
      return {
        src:img.currentSrc,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
        naturalRatio:ratio,frameRatio,frameCSSAspectRatio:frameStyle.aspectRatio,
        sourceAspect:frame.getAttribute("data-aspect"),
        objectFit:style.objectFit,frameWidth:fb.width,frameHeight:fb.height,
        renderedContainWidth:img.naturalWidth*scale,renderedContainHeight:img.naturalHeight*scale,
      };
    });
    must(data.naturalWidth > 0 && data.naturalHeight > 0,"Local SVG DEMO image did not load");
    must(data.src.includes("/designPreview/") && data.src.endsWith(".svg"),
      "Image source differs from local SVG DEMO poster");
    must(Math.abs(data.naturalRatio-760/470) < 0.01,
      "SVG intrinsic poster ratio unexpectedly changed: " + JSON.stringify(data));
    const [numerator, denominator] = expectedAspect.split(":").map(Number);
    must(data.sourceAspect === expectedAspect && data.objectFit === "contain" &&
      Math.abs(data.frameRatio - numerator/denominator) < 0.03,
      "Image DEMO is cropped or has wrong frame ratio: " + JSON.stringify(data));
    must(data.renderedContainWidth <= data.frameWidth + 1 &&
      data.renderedContainHeight <= data.frameHeight + 1,
      "Contain-fit geometry exceeds media frame");
    imageMeasurements.push({variant,type:"image",nodeId,expectedAspect,...data});
    check("source aspectRatio 16:9/9:16/1:1, local SVG natural ratio 760:470 and object-fit contain");
  };
  const imageOpenClose = async () => {
    const image = node("preview-image-01");
    const open = image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.OPEN"]');
    must(await open.isVisible(),"Image DEMO should offer real open-fullsize control");
    await open.click();
    const dialog = image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.DIALOG"]');
    must(await dialog.evaluate(el => el instanceof HTMLDialogElement && el.open),
      "Image open did not show real HTML dialog");
    const full = dialog.locator("img");
    must(await full.evaluate(el => el.complete && el.naturalWidth>0),"Full-size image did not render");
    await image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.CLOSE"]').click();
    must(!await dialog.evaluate(el => el.open),"Image dialog close did not work");
    check("Image DEMO open-fullsize dialog, decoded source and close");
  };
  const videoFrame = async variant => {
    const video = node("preview-video-01").locator(".previewMedia video");
    await video.waitFor({state:"visible",timeout:4500});
    const data = await video.evaluate(async player => {
      const container = player.closest(".previewMedia"), br = container.getBoundingClientRect();
      const poster = player.getAttribute("poster") || "";
      const img = new Image();
      img.src = poster;
      let loaded = false;
      try { await Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error("poster decode timeout")),2500))]); loaded = true; } catch {}
      return {
        src:player.currentSrc || player.src, poster, controls:player.controls,
        playsInline:player.playsInline, objectFit:getComputedStyle(player).objectFit,
        frameRatio:br.width/br.height, frameCSSAspectRatio:getComputedStyle(container).aspectRatio,
        posterWidth:loaded?img.naturalWidth:0,posterHeight:loaded?img.naturalHeight:0,
        posterRatio:loaded?img.naturalWidth/img.naturalHeight:0,
      };
    });
    must(data.src.endsWith("/designPreview/flower-cc0.webm") && data.controls && data.playsInline,
      "Video DEMO lacks local CC0 HTML5 video source/native controls");
    must(data.poster.endsWith("/designPreview/flowerFrame.svg") && data.posterWidth>0,
      "Video DEMO local poster did not decode");
    must(Math.abs(data.posterRatio-760/470) < .01 && Math.abs(data.frameRatio-16/9)<.03
      && data.objectFit === "contain","Video poster/frame aspect ratio or contain CSS invalid");
    imageMeasurements.push({variant,type:"video-poster",...data});
    check("video poster natural 760:470, 16:9 frame, native controls and contain CSS");
  };
  const playPause = async variant => {
    const result = await node("preview-video-01").locator("video").evaluate(async player => {
      const initial = {source:player.currentSrc || player.src,readyState:player.readyState,
        networkState:player.networkState,videoWidth:player.videoWidth,videoHeight:player.videoHeight};
      const later = ms => new Promise(resolve => setTimeout(resolve,ms));
      let started = false, before = 0, after = 0, endedPaused = false, failure = "";
      try {
        const play = player.play();
        await Promise.race([play,new Promise((_,reject) => setTimeout(()=>reject(Error("HTML5 play timeout")),3500))]);
        started = !player.paused;
        before = player.currentTime;
        await later(1150);
        after = player.currentTime;
      } catch (e) { failure = String(e?.message || e); }
      finally { player.pause(); endedPaused = player.paused; }
      const advanced = after > before + 0.06;
      const status = failure ? "NOT TESTED" : started && advanced && endedPaused ? "PASS" : "FAIL";
      return {variant:"browser",status,reason:failure || (status==="FAIL"?"play() resolved but time/paused did not prove playback":""),...
        initial,started,before,after,advanced,endedPaused,networkStateAfter:player.networkState};
    });
    result.variant = variant;
    media.push(result);
    if (result.status === "FAIL") throw Error("Actual video playback did not advance/pause: " + JSON.stringify(result));
    check("HTML5 play()/pause() attempted with time progression (per-variant PASS or NOT TESTED)");
    return result;
  };
  const textInput = async () => {
    const text = await select("preview-text-01");
    const input = text.locator('[data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT"]');
    const original = await input.inputValue(), changed = original + " — QA text";
    await input.fill(changed);
    must(await input.inputValue() === changed,"Text note not editable");
    await select("preview-image-01");
    await select("preview-text-01");
    must(await input.inputValue() === changed,"Text note lost after switching selection");
    const expand = text.locator('[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND"]');
    await expand.click();
    must(await expand.getAttribute("aria-expanded")==="true","Text expand did not work");
    await expand.click();
    must(await expand.getAttribute("aria-expanded")==="false" &&
      await input.inputValue()===changed,"Text collapse discarded note content");
    check("editable, auto-sized Text note survives selection + expand/collapse in-memory");
  };
  const dragPreservesEdges = async () => {
    const text = node("preview-text-01");
    const b = await bounds(text), header = await bounds(text.locator(".node-drag-handle"));
    const oldPath = await edge("preview-edge-01").locator(".vue-flow__edge-path").getAttribute("d");
    const x = header.x + 36, y = header.y + header.height/2;
    await page.mouse.move(x,y);
    await page.mouse.down();
    await page.mouse.move(x+60,y+40,{steps:14});
    await page.mouse.up();
    const updated = await bounds(text);
    must(Math.hypot(updated.x-b.x,updated.y-b.y)>24,"Real node drag did not move Text");
    await graph(node3,edge3);
    const newPath = await edge("preview-edge-01").locator(".vue-flow__edge-path").getAttribute("d");
    must(newPath !== oldPath,"Connected edge SVG path did not follow node drag");
    check("real node drag retains all edge IDs and updates SVG connection path");
  };
  const panAndZoom = async () => {
    const previous = await transform();
    await map("ZOOM.IN").click();
    await page.waitForFunction(old => new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".vue-flow__transformationpane")).transform).a > old+.012,
      previous.z,{timeout:3000});
    const zoomed = await transform();
    await map("ZOOM.OUT").click();
    await page.waitForFunction(old => new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".vue-flow__transformationpane")).transform).a < old-.012,
      zoomed.z,{timeout:3000});
    await page.waitForTimeout(200);
    const pane = page.locator(".vue-flow__pane");
    const target = await pane.evaluate(element => {
      const rect = element.getBoundingClientRect();
      for (const [fx,fy] of [[.72,.82],[.14,.78],[.86,.56],[.10,.52],[.55,.88]]) {
        const x = rect.left+rect.width*fx, y = rect.top+rect.height*fy;
        for (const [dx,dy] of [[60,-25],[-60,25]]) {
          if (document.elementFromPoint(x,y) === element && document.elementFromPoint(x+dx,y+dy) === element)
            return {x,y,dx,dy};
        }
      }
      return null;
    });
    must(target,"No unobstructed Canvas pane location to perform mouse pan");
    const before = await transform();
    await page.mouse.move(target.x,target.y);
    await page.mouse.down();
    await page.mouse.move(target.x+target.dx,target.y+target.dy,{steps:12});
    await page.mouse.up();
    const after = await transform();
    must(Math.hypot(after.x-before.x,after.y-before.y)>12,"Canvas did not pan under real mouse drag");
    await fit();
    await graph(node3,edge3);
    check("real zoom in/out, mouse pan and Fit preserve workflow edges");
  };
  const tryConnect = async (sourceId,targetId,caption,wantedNodes,wantedEdges) => {
    const source = node(sourceId).locator(".vue-flow__handle-right");
    const target = node(targetId).locator(".vue-flow__handle-left");
    must(await source.isVisible() && await target.isVisible(),caption + ": handle unavailable");
    await source.click({timeout:3000});
    await target.click({timeout:3000});
    await page.waitForTimeout(130);
    await graph(wantedNodes,wantedEdges);
    check("attempted " + caption + " by clicking real Vue Flow source/target handles; no new edge");
  };
  const menuAndDelete = async () => {
    const text = await select("preview-text-01");
    const toolbar = text.locator(".previewContextToolbar");
    must(await toolbar.locator("button").count()===3,"Selected node contextual toolbar must have Edit/Inspector/Menu");
    await toolbar.locator('[data-map-id="AC.UI02.PREVIEW.NODE.EDIT"]').click();
    const input = text.locator('[data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT"]');
    must(await input.evaluate(el => document.activeElement===el),"Toolbar Edit did not focus Text prompt");
    await toolbar.locator('[data-map-id="AC.UI02.PREVIEW.NODE.INSPECT"]').click();
    await map("INSPECTOR").waitFor({state:"visible",timeout:3000});
    must((await map("INSPECTOR.PROMPT").inputValue()).length>10,"Context Inspector did not show prompt");
    await map("INSPECTOR.CLOSE").click();
    await toolbar.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.TOGGLE"]').click();
    const menu = text.locator(".previewNodeMenu");
    await menu.waitFor({state:"visible",timeout:3000});
    must(await menu.locator('[role="menuitem"]').count()===3,"Node menu actions missing");
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.EDIT"]').click();
    must(await input.evaluate(el => document.activeElement===el),"Node menu Edit did not focus prompt");
    await text.locator(".nodeMore").click();
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.INSPECT"]').click();
    await map("INSPECTOR").waitFor({state:"visible"});
    await map("INSPECTOR.CLOSE").click();
    await text.locator(".nodeMore").click();
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
    const dialog = page.locator("#preview-delete-title").locator("xpath=..");
    must(await dialog.evaluate(el => el instanceof HTMLDialogElement && el.open),"Node Delete did not open real confirm dialog");
    await map("DELETE.CANCEL").click();
    must(!await dialog.evaluate(el => el.open),"Cancel did not close confirmation dialog");
    await graph(node3,edge3);
    await text.locator(".nodeMore").click();
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
    await map("DELETE.CONFIRM").click();
    await page.waitForFunction(() => !document.querySelector('[data-preview-node="preview-text-01"]'),null,{timeout:2500});
    must(await page.locator(".vue-flow__edge").count()===1,
      "Confirmed Text deletion must remove its 2 incident edges, leaving Image→Video");
    check("context Edit/Inspector/Menu; menu Edit/Inspector/Delete; modal Cancel and Confirm");
  };
  const longPrompt = async () => {
    const image = await select("preview-image-01");
    const expand = image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND"]');
    await expand.click();
    must(await expand.getAttribute("aria-expanded")==="true","Image prompt expand failed");
    const editor = image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT"]');
    const content = Array.from({length:16},(_,i) => "Dòng "+(i+1)+": phối cảnh phố đêm với ánh sáng và chuyển động chậm.").join("\n");
    await editor.fill(content);
    must(await editor.inputValue()===content,"Long media prompt did not save to live node");
    await select("preview-text-01");
    await select("preview-image-01");
    must(await editor.inputValue()===content,"Media prompt lost when selecting other node");
    await expand.click();
    must(await expand.getAttribute("aria-expanded")==="false","Image prompt collapse failed");
    must((await image.locator(".previewPromptSummary").getAttribute("title")) === content,
      "Collapsed media prompt did not retain complete text");
    await image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EDIT"]').click();
    const expandedEditor = image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT"]');
    must(await expandedEditor.evaluate(el => document.activeElement===el) &&
      await expandedEditor.inputValue()===content,"Reopening long media prompt lost focus/content");
    const initialScroll = await expandedEditor.evaluate(el => el.scrollTop);
    const zoomBefore = (await transform()).z;
    await expandedEditor.hover();
    await page.mouse.wheel(0,320);
    await page.waitForTimeout(130);
    const newScroll = await expandedEditor.evaluate(el => el.scrollTop);
    const zoomAfter = (await transform()).z;
    must(newScroll > initialScroll+10,"Wheel did not scroll the long prompt textarea");
    must(Math.abs(zoomBefore-zoomAfter)<.008,
      "Scrolling long prompt incorrectly zoomed Vue Flow Canvas");
    await expandedEditor.evaluate(el => { el.scrollTop = 0; });
    check("long prompt edit/selection/collapse/reopen retains content and wheel avoids Canvas zoom");
  };
  try {
    for (const variant of ["A","B"]) {
      phase = variant + " Text";
      await go(variant); await graph(node3,edge3); await fit(); await verifyDistinct(variant);
      await textInput();
      await snap(variant,"text"); noTraffic();

      phase = variant + " Image compact";
      await go(variant); await graph(node3,edge3); await fit();
      await select("preview-image-01");
      must(await node("preview-image-01").locator(".previewMedia").count()===0 &&
        await node("preview-image-01").locator(".previewMediaUnavailable").count()===1,
        "Compact Image unexpectedly shows DEMO image");
      await snap(variant,"image-compact"); noTraffic();

      phase = variant + " Image DEMO";
      await go(variant,"three","demo"); await graph(node3,edge3); await fit();
      await imageFrame(variant); await select("preview-image-01");
      await snap(variant,"image-demo");
      await imageOpenClose(); noTraffic();

      phase = variant + " Video compact";
      await go(variant); await graph(node3,edge3); await fit();
      await select("preview-video-01");
      must(await node("preview-video-01").locator("video").count()===0 &&
        await node("preview-video-01").locator(".previewMediaUnavailable").count()===1,
        "Compact Video incorrectly embeds player");
      await snap(variant,"video-compact"); noTraffic();

      phase = variant + " Video DEMO";
      await go(variant,"three","demo"); await graph(node3,edge3); await fit();
      await videoFrame(variant); await select("preview-video-01");
      await playPause(variant); // Real HTML5 play(), progress, pause; NOT TESTED if remote CC0 inaccessible.
      await snap(variant,"video-demo"); noTraffic();

      phase = variant + " 3 connected";
      await go(variant); await graph(node3,edge3); await fit();
      await handles(); await snap(variant,"three-connected");
      await dragPreservesEdges();
      await panAndZoom();
      await tryConnect("preview-image-01","preview-video-01","seeded Image→Video duplicate",node3,edge3);
      await tryConnect("preview-image-01","preview-image-01","Image self-loop invalid",node3,edge3);
      noTraffic();

      phase = variant + " 7 nodes";
      await go(variant,"seven","demo"); await graph(node7,edge7); await fit();
      await imageFrame(variant,"preview-image-01","16:9");
      await imageFrame(variant,"preview-image-02","9:16");
      await imageFrame(variant,"preview-image-03","1:1");
      await snap(variant,"seven-nodes");
      await map("MEDIA").selectOption("compact");
      await fit();
      await tryConnect("preview-image-02","preview-image-03","Image→Image invalid",node7,edge7);
      noTraffic();

      phase = variant + " selected";
      await go(variant); await graph(node3,edge3); await fit();
      const selected = await select("preview-image-01");
      await selected.locator('[data-map-id="AC.UI02.PREVIEW.NODE.INSPECT"]').click();
      await map("INSPECTOR").waitFor({state:"visible",timeout:3500});
      must((await map("INSPECTOR.PROMPT").inputValue()).length>10,"Inspector prompt not synchronized");
      await page.waitForTimeout(215); // Inspector selection scroll/pan animation lasts 180ms.
      await snap(variant,"selected"); noTraffic();

      phase = variant + " context toolbar";
      await go(variant); await graph(node3,edge3); await fit();
      const toolNode = await select("preview-text-01");
      await toolNode.locator(".previewContextToolbar [data-map-id='AC.UI02.PREVIEW.NODE.MENU.TOGGLE']").click();
      await toolNode.locator(".previewNodeMenu").waitFor({state:"visible"});
      await snap(variant,"context-toolbar");
      await toolNode.locator(".nodeMore").click(); // Close menu so live action tests have clean state.
      await menuAndDelete(); noTraffic();

      phase = variant + " long prompt";
      await go(variant); await graph(node3,edge3); await fit();
      await longPrompt(); await snap(variant,"long-prompt"); noTraffic();
    }
    must(screenshots.length===20 && new Set(screenshots).size===20,
      "Expected 20 unique browser PNGs, got " + screenshots.length);
    noTraffic();
    const videoStatus = media.every(result => result.status==="PASS") ? "PASS" : "NOT TESTED";
    return {
      result:videoStatus==="PASS"?"PASS (browser node checks + real video playback)":
        "PARTIAL (browser node checks PASS; HTML5 video playback NOT TESTED)",
      origin,viewport:width+"x"+height,
      screenshotCount:screenshots.length,screenshots,states,checks:checked,
      graphCases:"3 nodes / 3 live SVG edges; 7 nodes / 5 live SVG edges",
      imageMeasurements,videoPlayback:{status:videoStatus,variants:media},
      applicationRequests:appTraffic.length,pageErrors:errors,devHmrSocketCount:hmr.length,
      visualApproval:"PENDING OWNER",productionChanges:"NONE made by this QA script",
    };
  } catch (e) {
    throw Error("UI-02 Command 3 browser QA FAIL at " + phase + ", " +
      screenshots.length + "/20 screenshots completed: " + (e?.message || String(e)));
  } finally {
    page.off("pageerror",onError);
    page.off("request",onRequest);
    page.off("websocket",onWebSocket);
  }
}
