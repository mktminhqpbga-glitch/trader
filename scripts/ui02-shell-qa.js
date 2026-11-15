// UI-02 Command 2/5: live A/B shell, Canvas toolbar and responsive browser QA.
// Requires an already-open DEV preview page in the SAME Playwright CLI session:
// npx --yes playwright@1.65.1 cli -s=ui02shell open 'http://127.0.0.1:5193/?designPreview=A'
// npx --yes playwright@1.65.1 cli -s=ui02shell run-code --filename scripts/ui02-shell-qa.js
// No standalone browser launch, backend, SQLite, AI requests or persisted test data.
async (page) => {
  const startUrl = new URL(page.url());
  if (!/^https?:$/.test(startUrl.protocol) || !/^(A|B)$/.test(startUrl.searchParams.get("designPreview") || "")) {
    throw Error("Open ?designPreview=A or ?designPreview=B on the isolated DEV Vite URL before run-code");
  }
  const origin = startUrl.origin;
  const sizes = [[1920,1080],[1440,900],[1280,800],[1024,768],[390,844]];
  const node3 = ["preview-text-01","preview-image-01","preview-video-01"];
  const edge3 = ["preview-edge-01","preview-edge-02","preview-edge-03"];
  const node7 = [...node3,"preview-text-02","preview-image-02","preview-image-03","preview-video-02"];
  const edge7 = [...edge3,"preview-edge-04","preview-edge-05"];
  const shots = [], matrix = [], checks = [];
  const pageErrors = [], appRequests = [], sockets = [];
  let stage = "initialization";
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const mark = name => { if (!checks.includes(name)) checks.push(name); };
  const map = id => page.locator('[data-map-id="' + id + '"]');
  const id = suffix => "AC.UI02.PREVIEW." + suffix;
  const onError = error => pageErrors.push(error.message);
  const onRequest = request => {
    const url = new URL(request.url());
    if (/\/api(?:\/|$)/i.test(url.pathname) || /^\/(?:ws|socket\.io)(?:\/|$)/i.test(url.pathname)) {
      appRequests.push({method:request.method(),url:request.url()});
    }
  };
  const onSocket = socket => sockets.push(socket.url());
  page.on("pageerror",onError);
  page.on("request",onRequest);
  page.on("websocket",onSocket);

  const clean = () => {
    assert(pageErrors.length === 0,"Uncaught browser errors: " + JSON.stringify(pageErrors));
    assert(appRequests.length === 0,"Preview sent /api or application socket request: " + JSON.stringify(appRequests));
    // Vite's own dev HMR WebSocket connects to the root of the DEV Vite host.
    // It is reported but is not an application AI/backend WebSocket.
    const unexpected = sockets.filter(raw => {
      const socket = new URL(raw);
      return socket.host !== startUrl.host || socket.pathname !== "/";
    });
    assert(unexpected.length === 0,"Preview opened non-Vite WebSocket(s): " + JSON.stringify(unexpected));
  };

  const go = async (variant, w, h, scenario) => {
    stage = variant + " " + w + "x" + h + " " + scenario + " navigation";
    await page.setViewportSize({width:w,height:h});
    await page.goto(origin + "/?designPreview=" + variant + "&scenario=" + scenario + "&media=compact");
    await map(id("ROOT")).waitFor({state:"visible",timeout:8000});
    assert(await map(id("MODE." + variant)).getAttribute("aria-pressed") === "true",
      "Active A/B mode button does not match the requested variant");
    assert((await map(id("ROOT")).getAttribute("class") || "").includes("variant" + variant),"Wrong root layout variant");
    assert(await map(id("STAGE")).isVisible(),"Canvas stage is not visible");
    assert(await map(id("SCENARIO")).inputValue() === scenario,"Scenario selector did not retain " + scenario);
    assert(await map(id("MEDIA")).inputValue() === "compact","Expected identical compact media state for A/B");
    clean();
  };

  const graph = async (expectedNodes, expectedEdges) => {
    try {
      await page.waitForFunction(({nodes,edges}) => {
        if (!document.querySelector(".vue-flow")) return false;
        const nodeElements = [...document.querySelectorAll(".vue-flow__node")];
        const edgeElements = [...document.querySelectorAll(".vue-flow__edge")];
        const renderedNodes = nodeElements.map(el => el.getAttribute("data-id"));
        const renderedEdges = edgeElements.map(el => el.getAttribute("data-id"));
        return renderedNodes.length === nodes.length && renderedEdges.length === edges.length
          && nodes.every(value => renderedNodes.includes(value))
          && edges.every(value => renderedEdges.includes(value))
          && edgeElements.every(el => {
            const path = el.querySelector(".vue-flow__edge-path")?.getAttribute("d") || "";
            return path.startsWith("M") && path.length > 18 && !/NaN|undefined/.test(path);
          });
      },{nodes:expectedNodes,edges:expectedEdges},{timeout:9000});
    } catch {
      const found = await page.locator(".vue-flow__edge").evaluateAll(items => items.map(el => ({id:el.getAttribute("data-id"),path:el.querySelector(".vue-flow__edge-path")?.getAttribute("d")})));
      const diagnostic = await page.locator(".previewCanvasInfo").getAttribute("data-flow-state");
      throw Error("Expected " + expectedNodes.length + " node(s) and exact SVG edges " + JSON.stringify(expectedEdges)
        + "; rendered=" + JSON.stringify(found) + "; flow=" + diagnostic);
    }
    const label = await page.locator(".previewCanvasInfo strong").innerText();
    assert(label.includes(expectedNodes.length + " node · " + expectedEdges.length + " kết nối"),
      "Canvas counters disagree with the actual SVG graph: " + label);
    mark("exact live Vue Flow nodes + edge IDs/SVG paths");
  };

  const rects = async () => page.evaluate(() => {
    const get = selector => {
      const el = document.querySelector(selector);
      if (!el || getComputedStyle(el).display === "none" || getComputedStyle(el).visibility === "hidden") return null;
      const b = el.getBoundingClientRect();
      if (b.width <= 0 || b.height <= 0) return null;
      return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,width:b.width,height:b.height};
    };
    return {
      header:get(".previewTopbar"), strip:get(".previewReviewStrip"), brand:get(".previewBrand"),
      switch:get(".variantSwitch"), demo:get(".previewHeaderDemo"), topAction:get(".previewTopAction"),
      stage:get(".previewCanvasArea"), toolbar:get(".previewCanvasToolbar"), dock:get(".previewFloatDock"),
      rail:get(".previewSceneRail"), film:get(".previewShotStrip"), inspector:get(".previewInspector"),
      workspace:get(".previewWorkspace"),
      scrollWidth:document.documentElement.scrollWidth, bodyWidth:document.body?.scrollWidth || 0,
      viewportWidth:window.innerWidth, viewportHeight:window.innerHeight,
      inspectorPosition:getComputedStyle(document.querySelector(".previewInspector") || document.body).position,
    };
  });
  const area = (a,b) => !a || !b ? 0 : Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)) * Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const inside = (inner,outer,pad=2) => !!inner && !!outer && inner.left >= outer.left-pad && inner.right <= outer.right+pad && inner.top >= outer.top-pad && inner.bottom <= outer.bottom+pad;

  const layout = async (variant, w, h, inspectorOpen = false) => {
    const box = await rects();
    assert(box.viewportWidth === w && box.viewportHeight === h,"Browser viewport changed unexpectedly");
    assert(box.scrollWidth <= w+1 && box.bodyWidth <= w+1,"Horizontal document overflow at " + w + "px: " + JSON.stringify({root:box.scrollWidth,body:box.bodyWidth}));
    assert(box.header && box.strip && box.stage && box.toolbar && box.demo,"Missing header/review strip/stage/toolbar/DEMO badge");
    assert(inside(box.header,{left:0,right:w,top:0,bottom:h}),"Header extends outside the viewport");
    assert(box.strip.top >= box.header.bottom-2,"Review strip overlaps the header");
    assert(box.stage.top >= box.strip.bottom-2,"Canvas stage overlaps the header/review strip");
    assert(inside(box.toolbar,box.stage,3),"Canvas toolbar extends outside the stage");
    assert(area(box.header,box.toolbar) < 2,"Canvas toolbar overlaps the top header");
    const headerControls = [["logo",box.brand],["mode switch",box.switch],["DEMO",box.demo],["project action",box.topAction]];
    for (let i=0;i<headerControls.length;i++) {
      assert(headerControls[i][1] && inside(headerControls[i][1],box.header,2),"Header control out of bounds: " + headerControls[i][0]);
      for (let j=i+1;j<headerControls.length;j++) {
        assert(area(headerControls[i][1],headerControls[j][1]) < 2,
          "Header controls overlap: " + headerControls[i][0] + " / " + headerControls[j][0]);
      }
    }
    if (variant === "A") {
      assert(box.dock && !box.rail && !box.film,"A should have the floating dock without B panels");
      assert(inside(box.dock,box.stage,3),"A floating dock escapes the Canvas stage");
      assert(area(box.dock,box.toolbar) < 2,"A dock overlaps the bottom Canvas toolbar");
      assert(area(box.dock,box.header) < 2,"A dock overlaps the header");
    } else {
      assert(!box.dock && box.rail,"B requires Scene Navigator without A floating dock");
      assert(area(box.rail,box.toolbar) < 2,"B Scene Navigator overlaps Canvas toolbar");
      if (w > 760) {
        assert(box.film,"B desktop filmstrip missing");
        assert(box.rail.right <= box.stage.left+3,"B Navigator is not beside the Canvas");
        assert(box.film.top >= box.stage.bottom-3,"B filmstrip overlaps the Canvas stage");
        assert(area(box.film,box.toolbar) < 2,"B filmstrip overlaps Canvas toolbar");
      } else {
        assert(!box.film,"B mobile filmstrip should be folded into Scene Navigator");
        assert(box.rail.bottom <= box.stage.top+3,"B mobile Scene Navigator should sit above the Canvas");
      }
    }
    if (inspectorOpen) {
      assert(box.inspector,"Open Inspector is missing from the rendered layout");
      assert(area(box.header,box.inspector) < 2,"Inspector overlaps the header");
      assert(inside(box.inspector,box.workspace,3),"Inspector escapes the workspace");
      if (variant === "B" && w > 760) {
        assert(box.inspectorPosition !== "absolute","B desktop Inspector must be docked");
        assert(box.inspector.left >= box.stage.right-3,"B desktop Inspector overlaps the Canvas stage instead of docking");
      }
      if (variant === "B" && w <= 760) {
        assert(box.inspectorPosition !== "absolute","B mobile Inspector must use a bottom dock, not an absolute overlay");
        assert(box.inspector.top >= box.stage.bottom-3,"B mobile Inspector dock must start below the Canvas stage");
        assert(area(box.inspector,box.stage) < 2,"B mobile Inspector dock must not overlap the clickable Canvas stage");
      }
    }
    mark("exact viewport + zero horizontal document overflow");
    mark("header, dock, toolbar and scene layout geometry");
    if (inspectorOpen) mark("Inspector desktop side dock/mobile bottom dock without Canvas overlap");
  };

  const verifyButton = async locator => {
    assert(await locator.count()===1 && await locator.isVisible() && await locator.isEnabled(),"Required control missing, hidden or disabled");
    const title = (await locator.getAttribute("title") || "").trim();
    const label = (await locator.getAttribute("aria-label") || "").trim();
    assert(title && label,"Control requires an informative title tooltip and aria-label");
    await locator.focus();
    assert(await locator.evaluate(element => document.activeElement === element),"Button is not keyboard focusable: " + label);
    assert(await locator.evaluate(element => {
      const b = element.getBoundingClientRect();
      const target = document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
      return !!target && element.contains(target);
    }),"A visible control is blocked or its center is outside the viewport: " + label);
    mark("button tooltip, label, focus and unobstructed click target");
  };

  const checkShellControls = async (variant,w) => {
    assert(await map(id("DEMO.STATUS")).isVisible() && (await map(id("DEMO.STATUS")).innerText()).includes("DEMO"),"Header DEMO badge missing");
    assert((await map(id("DEMO.STATUS")).getAttribute("title") || "").length>8,"Header DEMO tooltip missing");
    for (const section of ["HOME","MODE.A","MODE.B"]) await verifyButton(map(id(section)));
    await verifyButton(page.locator(".previewTopbar").locator('[data-map-id="' + id("PROJECTS") + '"]'));
    for (const control of ["ZOOM.IN","ZOOM.OUT","FIT"]) await verifyButton(map(id(control)));
    await verifyButton(page.locator(".previewCanvasToolbar").locator('[data-map-id="' + id("ADD") + '"]'));
    if (variant === "A") {
      const buttons = map(id("DOCK")).locator("button");
      assert(await buttons.count()===4,"A floating dock must have exactly Add, Library, Fit, More buttons");
      for (const button of await buttons.all()) await verifyButton(button);
      assert(await map(id("DOCK.MORE")).count()===1,"A More button MapID missing");
    } else {
      assert(await page.locator(".previewSceneRail").isVisible(),"B Scene Navigator is hidden");
      await verifyButton(page.locator(".previewSceneRail").locator('[data-map-id="' + id("ADD") + '"]'));
      assert(await page.locator(".sceneRailItem").count()===3,"B Scene Navigator must show 3 scenario nodes");
      if (w>760) assert(await page.locator(".shotStripItems button").count()===3,"B filmstrip must show 3 scenario nodes");
    }
    mark("A four-action dock / B Navigator + responsive filmstrip");
  };

  const currentTransform = async () => page.locator(".vue-flow__transformationpane").evaluate(element => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return {x:matrix.m41,y:matrix.m42,zoom:matrix.a};
  });
  const changedZoom = async (before,direction) => page.waitForFunction(({before,direction}) => {
    const pane = document.querySelector(".vue-flow__transformationpane");
    if (!pane) return false;
    const z = new DOMMatrixReadOnly(getComputedStyle(pane).transform).a;
    return direction === "in" ? z > before+0.01 : z < before-0.01;
  },{before,direction},{timeout:3500});
  const zoomFit = async () => {
    const plus = map(id("ZOOM.IN")), minus = map(id("ZOOM.OUT"));
    const old = await currentTransform();
    await plus.click();
    await changedZoom(old.zoom,"in");
    const higher = await currentTransform();
    await minus.click();
    await changedZoom(higher.zoom,"out");
    const beforeSecondIncrease = await currentTransform();
    await plus.click();
    await changedZoom(beforeSecondIncrease.zoom,"in");
    await plus.click();
    await page.waitForTimeout(190); // Vue Flow zoomIn/Out animated duration = 160ms.
    const beforeFit = await currentTransform();
    await map(id("FIT")).click();
    await page.waitForFunction(({x,y,zoom}) => {
      const pane = document.querySelector(".vue-flow__transformationpane");
      if (!pane) return false;
      const next = new DOMMatrixReadOnly(getComputedStyle(pane).transform);
      return Math.abs(next.a-zoom)>0.02 || Math.hypot(next.m41-x,next.m42-y)>6;
    },beforeFit,{timeout:3500});
    await page.waitForTimeout(260); // fitView animation = 240ms.
    const fitStage = await map(id("STAGE")).boundingBox();
    assert(fitStage,"Canvas disappeared during Fit");
    for (const node of node3) {
      const box = await page.locator('[data-preview-node="' + node + '"]').boundingBox();
      assert(box && box.x >= fitStage.x-10 && box.y >= fitStage.y-10
        && box.x+box.width <= fitStage.x+fitStage.width+10
        && box.y+box.height <= fitStage.y+fitStage.height+10,
      "Fit did not contain seeded node " + node + " within Canvas stage");
    }
    mark("real zoom-in, zoom-out and Fit viewport transformation");
  };

  const palette = async () => {
    await page.locator(".previewCanvasToolbar").locator('[data-map-id="' + id("ADD") + '"]').click();
    const menu = map(id("PALETTE"));
    await menu.waitFor({state:"visible",timeout:3000});
    assert(await map(id("ADD.TEXT")).isVisible() && await map(id("ADD.IMAGE")).isVisible()
      && await map(id("ADD.VIDEO")).isVisible(),"Palette must expose the real Text/Image/Video actions");
    const input = menu.locator('input[type="search"]');
    assert(await input.evaluate(el => document.activeElement===el),"Palette search did not receive keyboard focus");
    await map(id("PALETTE.CLOSE")).click();
    assert(await menu.count()===0,"Palette Close did not close the dialog");
    mark("palette opens, focuses search and closes");
  };

  const testADockActions = async () => {
    const dock = map(id("DOCK"));
    const more = map(id("DOCK.MORE"));
    await dock.locator('[data-map-id="' + id("ADD") + '"]').click();
    assert(await map(id("PALETTE")).isVisible(),"A dock Add button did not open Palette");
    await map(id("PALETTE.CLOSE")).click();
    await more.click();
    assert(await more.getAttribute("aria-expanded") === "true" && await map(id("DOCK.MENU")).isVisible(),"A More button did not open menu");
    assert(await map(id("DOCK.MENU")).locator('[role="menuitem"]').count()>=3,"A More menu has no usable actions");
    await map(id("DOCK.MENU.SCENES")).click();
    await graph(node7,edge7);
    assert(await map(id("DOCK.MENU")).count()===0,"A More menu did not close after selecting scenes");
    await more.click();
    await map(id("DOCK.MENU.MEDIA")).click();
    assert(await map(id("MEDIA")).inputValue()==="demo","A More Media command did not change the real media selector");
    assert(await page.locator(".previewMedia").count()===5,"A More Media command did not reveal all 5 demo media previews");
    await dock.locator('[data-map-id="' + id("PROJECTS") + '"]').click();
    assert(await map(id("LIBRARY")).isVisible(),"A dock Library action did not open project library");
    await page.locator(".previewTopbar").locator('[data-map-id="' + id("PROJECTS") + '"]').click();
    assert(await map(id("STAGE")).isVisible(),"Header return-to-Canvas action failed");
    await dock.locator('[data-map-id="' + id("FIT.DOCK") + '"]').click();
    assert(await map(id("STAGE")).isVisible(),"A dock Fit action removed the Canvas");
    mark("A dock Add/Library/Fit and real More menu scenes/media actions");
  };

  const testBSceneActions = async (w) => {
    await page.locator('.sceneRailItem[data-preview-node-id="preview-image-01"]').click();
    await map(id("INSPECTOR")).waitFor({state:"visible",timeout:3000});
    assert((await page.locator(".inspectorIdentity h2").innerText()).includes("Phố đêm"),"B Navigator selected the wrong scene");
    await map(id("INSPECTOR.CLOSE")).click();
    if (w>760) {
      await page.locator('.shotStripItems [data-preview-node-id="preview-video-01"]').click();
      await map(id("INSPECTOR")).waitFor({state:"visible",timeout:3000});
      assert((await page.locator(".inspectorIdentity h2").innerText()).includes("Chuyển động"),"B filmstrip selected the wrong scene");
      await map(id("INSPECTOR.CLOSE")).click();
    }
    mark("B real Scene Navigator and desktop filmstrip navigation");
  };

  const testEmptyAdd = async () => {
    await map(id("EMPTY")).locator('[data-map-id="' + id("ADD") + '"]').click();
    await map(id("PALETTE")).waitFor({state:"visible",timeout:3000});
    await map(id("ADD.TEXT")).click();
    await graph(["preview-text-added-1"],[]);
    assert(await map(id("EMPTY")).count()===0,"Empty overlay remained after adding a real Text node");
    assert(await map(id("PALETTE")).count()===0,"Palette remained after adding Text");
    mark("empty-state Add inserts real Text node and hides empty view");
  };

  const openInspector = async (variant) => {
    if (variant === "B") {
      await page.locator('.sceneRailItem[data-preview-node-id="preview-image-01"]').click();
    } else {
      await page.locator('[data-preview-node="preview-text-01"] .previewNodeHeader').click();
      await map(id("DOCK.MORE")).click();
      assert(await map(id("DOCK.MENU.INSPECTOR")).isVisible(),"A More menu did not expose Inspector for selected node");
      await map(id("DOCK.MENU.INSPECTOR")).click();
    }
    await map(id("INSPECTOR")).waitFor({state:"visible",timeout:3500});
    assert((await map(id("INSPECTOR.PROMPT")).inputValue()).trim().length>10,"Inspector did not display the selected node prompt");
    assert(await map(id("INSPECTOR.CLOSE")).isVisible(),"Inspector close button missing");
    await page.waitForTimeout(225); // The selected-node visibility pan lasts 180ms.
    mark("Inspector opens from real selection with synchronized prompt");
  };

  const shot = async (variant,w,h,state) => {
    const path = "docs/evidence/ui02/command2/" + variant + "-" + w + "x" + h + "-" + state + ".png";
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.mouse.move(w-2,h-2);
    await page.screenshot({path,fullPage:false,animations:"disabled"});
    shots.push(path); // Record only after Chromium successfully created the file.
    return path;
  };

  try {
    for (const [w,h] of sizes) {
      for (const variant of ["A","B"]) {
        const item = {variant,viewport:w+"x"+h,files:{}};
        stage = variant + " " + w + "x" + h + " three";
        await go(variant,w,h,"three");
        await graph(node3,edge3);
        await map(id("FIT")).click();
        await page.waitForTimeout(265); // fitView duration is 240ms.
        await layout(variant,w,h);
        await checkShellControls(variant,w);
        clean();
        item.files.three = await shot(variant,w,h,"three");
        await zoomFit();
        await palette();
        if (variant === "A") await testADockActions();
        else await testBSceneActions(w);
        if (w===1440) {
          const opposite = variant==="A" ? "B" : "A";
          await map(id("MODE."+opposite)).click();
          assert((await map(id("ROOT")).getAttribute("class") || "").includes("variant"+opposite),"Header variant switch did not update layout");
          await map(id("MODE."+variant)).click();
          assert((await map(id("ROOT")).getAttribute("class") || "").includes("variant"+variant),"Header variant switch failed to restore layout");
          mark("working A/B header switch");
        }
        clean();

        stage = variant + " " + w + "x" + h + " empty";
        await go(variant,w,h,"empty");
        await graph([],[]);
        await map(id("EMPTY")).waitFor({state:"visible",timeout:3000});
        await layout(variant,w,h);
        clean();
        item.files.empty = await shot(variant,w,h,"empty");
        await testEmptyAdd();
        clean();

        stage = variant + " " + w + "x" + h + " seven";
        await go(variant,w,h,"seven");
        await graph(node7,edge7);
        await map(id("FIT")).click();
        await page.waitForTimeout(265);
        await layout(variant,w,h);
        if (variant === "B") {
          assert(await page.locator(".sceneRailItem").count()===7,"B Scene Navigator omitted nodes in seven-node state");
          if (w>760) assert(await page.locator(".shotStripItems button").count()===7,"B filmstrip omitted nodes in seven-node state");
        }
        clean();
        item.files.seven = await shot(variant,w,h,"seven");

        stage = variant + " " + w + "x" + h + " inspector";
        await openInspector(variant);
        await layout(variant,w,h,true);
        clean();
        item.files.inspector = await shot(variant,w,h,"inspector");
        await verifyButton(map(id("INSPECTOR.CLOSE")));
        await map(id("INSPECTOR.CLOSE")).click();
        assert(await map(id("INSPECTOR")).count()===0,"Close button did not hide Inspector");
        mark("Inspector close returns to Canvas");
        clean();
        matrix.push(item);
      }
    }
    assert(matrix.length===10,"Viewport/variant matrix is incomplete: " + matrix.length + "/10");
    assert(shots.length===40 && new Set(shots).size===40,"Expected exactly 40 unique Chromium screenshots, got " + shots.length);
    clean();
    return {
      result:"PASS — live DEV preview shell QA only; visual approval remains with project owner",
      origin,variants:["A","B"],viewports:sizes.map(([w,h])=>w+"x"+h),
      cases:matrix.length,screenshotCount:shots.length,screenshots:shots,
      matrix,checks,assertedApplicationRequests:appRequests.length,pageErrors,
      viteHmrWebSockets:sockets.filter(raw=>new URL(raw).host===startUrl.host && new URL(raw).pathname==="/").length,
      productionSource:"NOT MODIFIED BY THIS SCRIPT; confirm separately with git diff in the repository",
    };
  } catch (error) {
    throw Error("UI-02 Command 2 shell QA FAILED at " + stage + ": " + (error?.message || String(error)));
  } finally {
    page.off("pageerror",onError);
    page.off("request",onRequest);
    page.off("websocket",onSocket);
  }
}
