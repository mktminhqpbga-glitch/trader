// UI-02 LỆNH 4/5. Uses the EXISTING Playwright CLI session, not a new browser.
// cd /kkk && npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-menu-library-qa.js
// The tab must already be open on a DEV ?designPreview=A/B page (e.g. port 5193).
// Preview data is in memory only. All screenshots are written into command4/.
async (page) => {
  const initial = new URL(page.url());
  if (!/^https?:$/.test(initial.protocol) || !/^(A|B)$/.test(initial.searchParams.get("designPreview") || "")) {
    throw Error("Open DEV ?designPreview=A or B in existing ui02shell2 browser before running");
  }
  const origin = initial.origin;
  const evidence = "docs/evidence/ui02/command4/";
  const report = {result:"PENDING",origin,viewportDesktop:"1440x900",viewportMobile:"390x844",
    screenshots:[],cases:[],checks:[],unimplemented:[],apiCalls:[],pageErrors:[],hmrSockets:0,
    visualApproval:"PENDING OWNER",persistence:"DEV-only, in-memory; production not accessed"};
  const errors = report.pageErrors, calls = report.apiCalls;
  let phase = "startup";
  const assert = (ok,msg) => { if (!ok) throw Error(msg); };
  const check = msg => { if (!report.checks.includes(msg)) report.checks.push(msg); };
  const map = suffix => page.locator('[data-map-id="AC.UI02.PREVIEW.' + suffix + '"]');
  const node = id => page.locator('[data-preview-node="' + id + '"]');
  const activeNode = id => page.locator('.vue-flow__node[data-id="' + id + '"]');
  const project = id => page.locator('.previewProjectCard').filter({
    has:page.locator('[data-preview-project-id="' + id + '"]')
  });
  const beforeRequest = request => {
    const u = new URL(request.url());
    if (/\/api(?:\/|$)/i.test(u.pathname) || /^\/(?:ws|socket\.io)(?:\/|$)/i.test(u.pathname)) {
      calls.push({kind:"request",method:request.method(),url:request.url()});
    }
  };
  const beforeWebsocket = ws => {
    const u = new URL(ws.url());
    if (u.host===initial.host && u.pathname==="/") report.hmrSockets++;
    else calls.push({kind:"websocket",url:ws.url()});
  };
  const beforeError = err => errors.push(err.message);
  page.on("request",beforeRequest);
  page.on("websocket",beforeWebsocket);
  page.on("pageerror",beforeError);
  const safe = () => {
    assert(!errors.length,"Uncaught browser pageerrors: "+JSON.stringify(errors));
    assert(!calls.length,"Preview called application /api or WebSocket: "+JSON.stringify(calls));
  };
  const uniqueIds = () => page.evaluate(() => {
    const elements = [...document.querySelectorAll("[id]")];
    const count = new Map();
    for (const el of elements) {
      if (!el.id) continue;
      count.set(el.id,(count.get(el.id)||0)+1);
    }
    return [...count].filter(([,n])=>n>1).map(([id,n])=>({id,n}));
  });
  const ids = async () => {
    const duplicate = await uniqueIds();
    assert(duplicate.length===0,"Duplicate literal DOM id attributes: "+JSON.stringify(duplicate));
    // Repeating MapIDs for repeated card/node actions is intentional, not a duplicate DOM id.
    check("no duplicated DOM id attributes (reused action MapIDs allowed on distinct instances)");
  };
  const shot = async (variant,state,width=1440,height=900) => {
    const file = evidence + variant + "-" + state + "-" + width + "x" + height + ".png";
    await page.screenshot({path:file,fullPage:false,animations:"disabled"});
    report.screenshots.push(file); // Only recorded after successful real Chromium PNG write.
    safe();
    await ids();
    return file;
  };
  const visible = async selector => {
    await selector.waitFor({state:"visible",timeout:3500});
    return selector;
  };
  const go = async (variant, screen="canvas",scenario="three",width=1440,height=900) => {
    phase=variant+" "+width+"x"+height+" "+screen+" "+scenario+" navigation";
    await page.setViewportSize({width,height});
    await page.goto(origin+"/?designPreview="+variant+"&screen="+screen+"&scenario="+scenario+"&media=compact");
    await visible(map("ROOT"));
    assert(await map("MODE."+variant).getAttribute("aria-pressed")==="true","Variant not active: "+variant);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1),"Viewport horizontal overflow");
    if (screen==="library") await visible(map("LIBRARY"));
    else await visible(map("STAGE"));
    const demo=map("DEMO.STATUS");
    assert(await demo.isVisible() && /DEMO/.test(await demo.innerText()),"Persistent DEMO badge missing");
    assert((await demo.getAttribute("title")||"").includes("không"),"DEMO badge must explain non-persistent data");
    await ids();
    safe();
  };
  const graph = async (count,edges) => {
    await page.waitForFunction(({count,edges}) => {
      const nodes=[...document.querySelectorAll(".vue-flow__node")];
      const drawn=[...document.querySelectorAll(".vue-flow__edge")];
      return nodes.length===count && drawn.length===edges
        && drawn.every(e=>{
          const d=e.querySelector(".vue-flow__edge-path")?.getAttribute("d")||"";
          return d.startsWith("M") && d.length>18 && !/NaN|undefined/.test(d);
        });
    },{count,edges},{timeout:8500});
    const meta=await page.locator(".previewCanvasInfo strong").innerText();
    assert(meta.includes(count+" node · "+edges+" kết nối"),"Canvas counts disagree with rendered SVG: "+meta);
    const actual=await page.evaluate(() => ({
      nodes:[...document.querySelectorAll(".vue-flow__node")].map(e=>e.getAttribute("data-id")),
      edges:[...document.querySelectorAll(".vue-flow__edge")].map(e=>e.getAttribute("data-id")),
    }));
    assert(new Set(actual.nodes).size===count && new Set(actual.edges).size===edges,
      "Repeated/missing Vue Flow node or edge IDs: "+JSON.stringify(actual));
    const expectedNodes=count===4?
      ["preview-text-01","preview-image-01","preview-video-01","preview-video-added-4"]:
      count===2?["preview-image-01","preview-video-01"]:
      ["preview-text-01","preview-image-01","preview-video-01"];
    const expectedEdges=edges===1?["preview-edge-02"]:
      ["preview-edge-01","preview-edge-02","preview-edge-03"];
    assert(expectedNodes.every(id=>actual.nodes.includes(id)) && expectedEdges.every(id=>actual.edges.includes(id)),
      "Seed graph IDs changed unexpectedly: "+JSON.stringify(actual));
    check("real Vue Flow node counts and visible SVG edges");
  };
  const flowTransform = () => page.locator(".vue-flow__transformationpane").evaluate(el=>{
    const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return {x:m.m41,y:m.m42,z:m.a};
  });
  const sameTransform = (before,after,tol=.6) => Math.abs(before.x-after.x)<tol
    && Math.abs(before.y-after.y)<tol && Math.abs(before.z-after.z)<.001;
  const geometry = async selector => {
    const b=await selector.boundingBox();
    assert(b && b.width>0 && b.height>0,"Missing measured panel geometry");
    return {left:b.x,top:b.y,right:b.x+b.width,bottom:b.y+b.height,width:b.width,height:b.height};
  };
  const intersect = (a,b) => Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))
    *Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const contained = (a,b,pad=3) => a.left>=b.left-pad && a.right<=b.right+pad
    && a.top>=b.top-pad && a.bottom<=b.bottom+pad;
  const palette = async (variant,width=1440,height=900) => {
    phase=variant+" "+width+"x"+height+" palette";
    await go(variant,"canvas","three",width,height);
    await graph(3,3);
    await map("FIT").click();
    await page.waitForTimeout(275);
    const add=page.locator(".previewCanvasToolbar").locator('[data-map-id="AC.UI02.PREVIEW.ADD"]');
    const old=await flowTransform();
    await add.click();
    const pop=await visible(map("PALETTE"));
    const bounds=await geometry(pop), stage=await geometry(map("STAGE"));
    assert(contained(bounds,stage),"Palette extends outside Canvas stage: "+JSON.stringify({bounds,stage}));
    const viewport={left:0,right:width,top:0,bottom:height};
    assert(contained(bounds,viewport),"Palette escapes visible viewport");
    assert(await pop.getAttribute("role")==="dialog","Palette missing dialog role");
    const search=pop.locator('input[type="search"]');
    assert(await search.evaluate(e=>document.activeElement===e),"Palette search not focused on opening");
    const item=kind=>map("ADD."+kind);
    for (const kind of ["TEXT","IMAGE","VIDEO"]) assert(await item(kind).isVisible(),"Missing Palette P0 item "+kind);
    check("Palette P01/P02/P03 items, focus, stage containment");
    await shot(variant,"palette",width,height);
    await search.fill("hình");
    assert(await pop.count()===1,"Palette closed when typing search");
    assert(await item("IMAGE").count()===1 && await item("TEXT").count()===0 && await item("VIDEO").count()===0,
      "Vietnamese Image search did not filter to exactly P02");
    await search.fill("video");
    assert(await item("VIDEO").count()===1 && await item("IMAGE").count()===0 && await item("TEXT").count()===0,
      "Video search did not filter to P03");
    await search.fill("zz-never-match-qa");
    assert(await pop.locator(".paletteNoMatch").isVisible() && await pop.locator(".previewPaletteItem").count()===0,
      "Palette unknown search did not show empty results");
    await search.fill("văn");
    assert(await item("TEXT").count()===1 && await item("VIDEO").count()===0 && await item("IMAGE").count()===0,
      "Text search did not filter to exactly P01");
    const after=await flowTransform();
    assert(sameTransform(old,after),"Palette click/search panned or zoomed Canvas");
    await shot(variant,"palette-filter",width,height);
    await search.press("Escape");
    assert(await pop.count()===0,"Escape did not close palette while input focused");
    await add.click();
    await visible(pop);
    // Click outside on a non-navigation part of the review strip, not the Canvas node.
    await page.locator(".reviewMarker").click();
    assert(await pop.count()===0,"Outside click did not dismiss Palette");
    await add.click();
    await visible(pop);
    await pop.locator('input[type="search"]').fill("video");
    await item("VIDEO").click();
    await page.waitForFunction(() => !!document.querySelector('[data-preview-node="preview-video-added-4"]'),null,{timeout:3500});
    await graph(4,3);
    assert(await pop.count()===0,"Palette stayed open after adding a real node");
    check("Palette true search, typing remains open, Escape/outside dismiss, no pan");
    check("Palette selection inserts a real in-memory node without duplicating seed SVG edges");
    await shot(variant,"palette-added",width,height);
    report.cases.push({variant,viewport:width+"x"+height,area:"palette",status:"PASS"});
  };
  const canvasEmpty = async variant => {
    phase=variant+" empty Canvas status";
    await go(variant,"canvas","empty");
    await map("EMPTY").waitFor({state:"visible",timeout:3500});
    await page.waitForFunction(()=>
      document.querySelectorAll(".vue-flow__node").length===0 &&
      document.querySelectorAll(".vue-flow__edge").length===0,null,{timeout:3500});
    assert((await page.locator(".previewCanvasInfo strong").innerText()).includes("0 node · 0 kết nối"),
      "Canvas Empty incorrectly reports populated graph");
    await shot(variant,"canvas-empty");
    await map("EMPTY").locator('[data-map-id="AC.UI02.PREVIEW.ADD"]').click();
    await visible(map("PALETTE"));
    await map("PALETTE.CLOSE").click();
    assert(await map("PALETTE").count()===0,"Empty-state palette close failed");
    check("Canvas Empty is true 0/0 state with real Add control and persistent DEMO label");
    report.cases.push({variant,viewport:"1440x900",area:"canvas-empty",status:"PASS"});
  };
  const select = async id => {
    const current=node(id);
    await current.locator(".node-drag-handle").click();
    await visible(current.locator(".previewContextToolbar"));
    return current;
  };
  const nodeCoord = id => activeNode(id).evaluate(el=>{
    const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return {x:m.m41,y:m.m42};
  });
  const modal = name => page.locator(name==="project"?"#preview-project-dialog-title":"#preview-delete-title").locator("xpath=..");
  const waitForModalClose = async type => {
    // Successful confirms mutate in-memory state immediately but intentionally
    // retain the native top-layer for 240ms to absorb the second double-click.
    // Require the actual dialog to exist and become closed; a missing element
    // must not masquerade as a successful close.
    await page.waitForFunction(kind => {
      const heading=document.querySelector(kind==="project"?
        "#preview-project-dialog-title":"#preview-delete-title");
      const dialog=heading?.closest("dialog");
      return dialog instanceof HTMLDialogElement && !dialog.open;
    },type,{timeout:1200});
  };
  const shownModal = async type => {
    const dialog=modal(type);
    assert(await dialog.evaluate(el=>el instanceof HTMLDialogElement && el.open),
      "Native "+type+" confirm dialog not open");
    assert(await dialog.evaluate(el=>el.contains(document.activeElement)),
      "Native "+type+" dialog did not capture keyboard focus");
    return dialog;
  };
  const nodeMenu = async variant => {
    phase=variant+" node-menu";
    await go(variant);
    await graph(3,3);
    await map("FIT").click();
    await page.waitForTimeout(275);
    const text=await select("preview-text-01");
    await text.locator(".nodeMore").click();
    const menu=await visible(text.locator(".previewNodeMenu"));
    assert(await menu.locator('[role="menuitem"]').count()===3,"Context node menu is missing Edit/Inspector/Delete");
    await shot(variant,"node-menu");
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.EDIT"]').click();
    const editor=text.locator('[data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT"]');
    assert(await editor.evaluate(el=>document.activeElement===el),"Node menu Edit did not focus prompt");
    await text.locator(".nodeMore").click();
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.INSPECT"]').click();
    await visible(map("INSPECTOR"));
    await map("INSPECTOR.CLOSE").click();
    await text.locator(".nodeMore").click();
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
    await shownModal("delete");
    await map("DELETE.CANCEL").click();
    assert(!await modal("delete").evaluate(el=>el.open),"Delete Cancel did not dismiss dialog");
    await graph(3,3);
    assert(await text.count()===1,"Delete Cancel removed the selected node");
    await text.locator(".nodeMore").click();
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]').click();
    await shownModal("delete");
    await map("DELETE.CONFIRM").click();
    await waitForModalClose("delete");
    await graph(2,1);
    assert(await text.count()===0,"Delete Confirm left Text node in Canvas");
    check("node menu Edit/Inspector/Delete + native cancel preserves graph, confirm removes incident edges");
    report.cases.push({variant,viewport:"1440x900",area:"context-menu",status:"PASS"});
  };
  const inspector = async (variant,width=1440,height=900) => {
    phase=variant+" "+width+"x"+height+" Inspector";
    await go(variant,"canvas","three",width,height);
    await graph(3,3);
    await map("FIT").click();
    await page.waitForTimeout(275);
    const image=node("preview-image-01");
    const original=await nodeCoord("preview-image-01");
    if (variant==="B") {
      await page.locator('.sceneRailItem[data-preview-node-id="preview-image-01"]').click();
    } else {
      await select("preview-image-01");
      await image.locator('.previewContextToolbar [data-map-id="AC.UI02.PREVIEW.NODE.INSPECT"]').click();
    }
    const panel=await visible(map("INSPECTOR"));
    await page.waitForTimeout(220); // preview ensures selected node visibility by viewport pan.
    const after=await nodeCoord("preview-image-01");
    assert(Math.hypot(after.x-original.x,after.y-original.y)<.5,
      "Opening Inspector mutated the graph's node position instead of viewport");
    const workspace=await geometry(map("CANVAS"));
    const stage=await geometry(map("STAGE")), box=await geometry(panel);
    assert(contained(box,workspace),"Inspector escapes workspace bounds");
    const cssPosition=await panel.evaluate(el=>getComputedStyle(el).position);
    if (variant==="A") {
      assert(cssPosition==="absolute","A Inspector must float as overlay");
      assert(box.width>250 && box.width<340,"A Inspector unexpected width: "+box.width);
    } else if (width>760) {
      assert(cssPosition!=="absolute" && box.width>250 && box.width<340,
        "B Inspector desktop must dock in 250–340px column");
      assert(box.left>=stage.right-3 && intersect(box,stage)<2,"B Inspector desktop covers stage");
    } else {
      assert(cssPosition!=="absolute","B mobile Inspector must bottom-dock rather than overlay");
      assert(box.top>=stage.bottom-3 && intersect(box,stage)<2,"B mobile Inspector hides clickable Canvas");
    }
    assert(await image.locator(".previewContextToolbar").isVisible(),"Selected node toolbar not preserved");
    assert((await image.getAttribute("class")||"").includes("selected"),"Selection lost on Inspector open");
    const inspectorText=map("INSPECTOR.PROMPT");
    const originalPrompt=await inspectorText.inputValue();
    assert(originalPrompt.length>20,"Inspector did not read selected node prompt");
    if (width>760) {
      const fromInspector=originalPrompt+" QA-INSPECTOR-"+variant;
      await inspectorText.fill(fromInspector);
      const summary=image.locator(".previewPromptSummary");
      assert(await summary.getAttribute("title")===fromInspector,
        "Inspector→Node prompt sync missing");
      await image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND"]').click();
      const textarea=image.locator('[data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT"]');
      assert(await textarea.inputValue()===fromInspector,"Inspector→expanded node textarea not synced");
      const fromNode=fromInspector+" QA-NODE-"+variant;
      await textarea.fill(fromNode);
      assert(await inspectorText.inputValue()===fromNode,"Node→Inspector prompt sync missing");
    }
    await shot(variant,width>760?"inspector":"mobile-inspector",width,height);
    await map("INSPECTOR.CLOSE").click();
    assert(await map("INSPECTOR").count()===0,"Close left Inspector overlay/panel");
    assert((await image.getAttribute("class")||"").includes("selected"),
      "Closing Inspector incorrectly unselected active node");
    const afterClose=await nodeCoord("preview-image-01");
    assert(Math.hypot(afterClose.x-original.x,afterClose.y-original.y)<.5,
      "Closing Inspector moved node's graph coordinates");
    check("A floating/B docked Inspector width/geometry, no position mutation, sync both ways, selection preserved on close");
    report.cases.push({variant,viewport:width+"x"+height,area:"inspector",status:"PASS"});
  };
  const libraryAssets = async (variant,width=1440,height=900) => {
    phase=variant+" "+width+"x"+height+" Library";
    await go(variant,"library","three",width,height);
    const cards=page.locator(".previewProjectCard");
    assert(await cards.count()===3,"Expected three unique demo project cards");
    const info=await cards.evaluateAll(items=>items.map(card=>{
      const cover=card.querySelector(".projectPreviewCover"),img=cover?.querySelector("img");
      const br=cover?.getBoundingClientRect();
      return {projectId:cover?.getAttribute("data-preview-project-id"),src:img?.currentSrc||"",
        complete:img?.complete,naturalWidth:img?.naturalWidth,naturalHeight:img?.naturalHeight,
        coverRatio:br&&br.height?br.width/br.height:0,objectFit:img?getComputedStyle(img).objectFit:""};
    }));
    assert(new Set(info.map(v=>v.projectId)).size===3 && info.every(v=>v.projectId),
      "Project IDs are missing/duplicated");
    assert(new Set(info.map(v=>v.src)).size===3 && info.every(v=>v.src.includes("/designPreview/")&&v.src.endsWith(".svg")),
      "Library covers must be three distinct local SVG illustrations");
    for (const entry of info) assert(entry.complete && entry.naturalWidth>0 && entry.naturalHeight>0
      && Math.abs(entry.coverRatio-1.6)<.035 && entry.objectFit==="cover",
      "Project cover did not load or break 16:10 frame: "+JSON.stringify(entry));
    if (width>760) {
      const columns=await page.locator(".previewProjectGrid").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
      assert(columns>=2,"Desktop library should use compact grid, not a single-column stack");
    } else {
      const columns=await page.locator(".previewProjectGrid").evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").length);
      assert(columns===1,"Mobile library should use single-column cards");
    }
    check("Project Library distinct local SVG posters, cover 16:10, responsive compact grid");
    await shot(variant,width>760?"library-grid":"mobile-library",width,height);
    return info;
  };
  const libraryFiltering = async variant => {
    phase=variant+" Library search/empty";
    await libraryAssets(variant);
    const search=map("PROJECT.SEARCH");
    await search.fill("neon");
    assert(await page.locator(".previewProjectCard").count()===1,"Project search did not filter to one Neon card");
    assert((await page.locator(".previewProjectCard").innerText()).toLocaleLowerCase("vi-VN").includes("neon"),
      "Filtered card does not match search");
    await shot(variant,"library-search");
    await search.fill("__qa-not-found-unique__");
    assert(await page.locator(".previewProjectCard").count()===0 && await map("LIBRARY.EMPTY").isVisible(),
      "Search zero-results empty state missing");
    await search.fill("");
    await map("LIBRARY.MODE").selectOption("empty");
    assert(await map("LIBRARY.EMPTY").isVisible() && await page.locator(".previewProjectCard").count()===0,
      "Library explicit empty mode did not hide projects");
    await shot(variant,"library-empty");
    check("Library live search matches/zero-results and explicit empty mode");
    await map("LIBRARY.MODE").selectOption("projects");
    const firstProject=page.locator(".previewProjectCard").first();
    await firstProject.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
    const actionMenu=await visible(firstProject.locator(".projectMoreMenu"));
    assert(await actionMenu.locator('[role="menuitem"]').count()===3,
      "Project menu requires Open / Rename / DeleteSoft");
    await actionMenu.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU.OPEN"]').click();
    assert(await map("STAGE").isVisible(),"Project menu Open did not open Canvas");
    await graph(3,3);
    await map("HOME").click();
    assert(await map("LIBRARY").isVisible(),"Home did not restore Library after menu Open");
    check("Project menu Open navigates to real Canvas; Home restores Library");
    await map("PROJECT.OPEN").first().click();
    assert(await map("STAGE").isVisible(),"Opening project card did not open Canvas");
    await graph(3,3);
    await map("HOME").click();
    assert(await map("LIBRARY").isVisible(),"Home did not return to Library");
    check("Project Open and Home navigation are functional");
    report.cases.push({variant,viewport:"1440x900",area:"library/search",status:"PASS"});
  };
  const openCreate = async () => {
    await page.locator(".previewLibraryHeader").locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.NEW"]').click();
    const dialog=await shownModal("project");
    const field=dialog.locator('input[type="text"]');
    assert(await field.count()===1,"Project dialog has no name field");
    return {dialog,field};
  };
  const projectCrud = async variant => {
    phase=variant+" Library CRUD";
    await go(variant,"library");
    const initialCount=await page.locator(".previewProjectCard").count();
    assert(initialCount===3,"Expected clean seed projects before CRUD");
    let {dialog,field}=await openCreate();
    await shot(variant,"create-dialog");
    const confirm=map("PROJECT.DIALOG.CONFIRM");
    assert(await confirm.isDisabled(),"Create must be disabled for empty name");
    await field.fill("     ");
    assert(await confirm.isDisabled(),"Whitespace-only name must remain disabled");
    await field.fill("QA temporary");
    await map("PROJECT.DIALOG.CANCEL").click();
    assert(!await dialog.evaluate(el=>el.open),"Create Cancel failed");
    assert(await page.locator(".previewProjectCard").count()===initialCount,"Create Cancel inserted ghost project");
    ({dialog,field}=await openCreate());
    await field.fill("QA temporary");
    await page.keyboard.press("Escape");
    assert(!await dialog.evaluate(el=>el.open),"Native ESC did not close Create dialog");
    assert(await page.locator(".previewProjectCard").count()===initialCount,"ESC created ghost project");
    ({dialog,field}=await openCreate());
    await field.fill("QA temporary");
    const b=await geometry(dialog);
    const clickX=Math.max(5,Math.floor(b.left-18)), clickY=Math.max(5,Math.floor(b.top-18));
    assert(clickX<b.left && clickY<b.top,"Cannot find backdrop outside project dialog");
    await page.mouse.click(clickX,clickY);
    assert(!await dialog.evaluate(el=>el.open),"Backdrop click did not close project dialog");
    assert(await page.locator(".previewProjectCard").count()===initialCount,"Backdrop created ghost project");
    ({dialog,field}=await openCreate());
    await field.fill("QA temporary");
    // Real double-click; one action must create at most one project in-memory.
    await map("PROJECT.DIALOG.CONFIRM").dblclick({delay:45});
    await waitForModalClose("project");
    assert(!await dialog.evaluate(el=>el.open),"Confirm left Create modal open");
    assert(await page.locator(".previewProjectCard").count()===initialCount+1,
      "Double-submit created missing or duplicate project");
    const card=page.locator(".previewProjectCard").filter({hasText:"QA temporary"});
    assert(await card.count()===1,"Created project missing or duplicated");
    const createdId=await card.locator(".projectPreviewCover").getAttribute("data-preview-project-id");
    assert(!!createdId,"Created card missing stable temporary ID");
    check("Native Create dialog keyboard focus, whitespace disabled, Cancel/ESC/backdrop and one-only double submit");

    await card.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
    const menu=await visible(card.locator(".projectMoreMenu"));
    assert(await menu.locator('[role="menuitem"]').count()===3,
      "Project menu must expose Open, Rename and DeleteSoft");
    await menu.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RENAME"]').click();
    dialog=await shownModal("project");
    field=dialog.locator('input[type="text"]');
    await shot(variant,"rename-dialog");
    assert(await field.inputValue()==="QA temporary","Rename field did not prefill existing name");
    await field.fill("QA temporary renamed");
    await map("PROJECT.DIALOG.CANCEL").click();
    assert(await page.locator(".previewProjectCard").filter({hasText:"QA temporary renamed"}).count()===0,
      "Rename Cancel committed changes");
    await card.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
    await card.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RENAME"]').click();
    await shownModal("project");
    await modal("project").locator('input[type="text"]').fill("QA temporary renamed");
    await map("PROJECT.DIALOG.CONFIRM").click();
    await waitForModalClose("project");
    const renamed=project(createdId);
    assert(await renamed.count()===1 && (await renamed.innerText()).includes("QA temporary renamed"),
      "Rename did not keep same Project ID and update card");
    assert(await page.locator(".previewProjectCard").count()===initialCount+1,
      "Rename duplicated project");
    await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]').click();
    await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE"]').click();
    await shownModal("delete");
    await map("DELETE.CANCEL").click();
    assert(await renamed.count()===1,"Soft-delete Cancel removed project");
    // requestDelete() leaves the card's menu open after Cancel in the current code.
    // Reopen it only if it was closed; do not accidentally toggle an open menu off.
    const projectMenuToggle=renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.MENU"]');
    if (await projectMenuToggle.getAttribute("aria-expanded")!=="true") await projectMenuToggle.click();
    await renamed.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.DELETE"]').click();
    await shownModal("delete");
    await map("DELETE.CONFIRM").click();
    await waitForModalClose("delete");
    assert(await renamed.count()===0 && await page.locator(".previewProjectCard").count()===initialCount,
      "Confirmed soft-delete left card visible");
    if (await map("PROJECT.TRASH").getAttribute("aria-expanded")==="false") {
      await map("PROJECT.TRASH").click();
    }
    assert(await map("PROJECT.TRASH").getAttribute("aria-expanded")==="true","Trash section did not open");
    const trash=page.locator(".trashProject").filter({hasText:"QA temporary renamed"});
    assert(await trash.count()===1,"Soft-deleted project missing from Trash");
    await shot(variant,"project-trash");
    await trash.locator('[data-map-id="AC.UI02.PREVIEW.PROJECT.RESTORE"]').click();
    assert(await project(createdId).count()===1 && await page.locator(".previewProjectCard").count()===initialCount+1,
      "Trash Restore did not recover original Project ID");
    assert(await page.locator(".trashProject").filter({hasText:"QA temporary renamed"}).count()===0,
      "Restored project still in Trash");
    check("Project New/Rename/SoftDelete/Trash/Restore preserve ID in tab; Cancel/Confirm paths work");
    await page.reload();
    await visible(map("LIBRARY"));
    assert(await page.locator(".previewProjectCard").count()===3,
      "Preview project mutation incorrectly persisted across reload");
    assert(await page.locator(".previewProjectCard").filter({hasText:"QA temporary renamed"}).count()===0,
      "In-memory project mutation leaked to fresh reload");
    check("Project CRUD writes only transient Vue preview data (reload resets)");
    report.cases.push({variant,viewport:"1440x900",area:"project-crud",status:"PASS"});
  };
  const statusScenarios = async variant => {
    phase=variant+" DEMO status";
    await go(variant);
    await graph(3,3);
    const selector=map("STATUS");
    const available=await selector.locator("option").evaluateAll(options=>options.map(o=>o.value));
    const statuses=[
      ["empty","Empty"],
      ["loading","Loading"],
      ["saved","Saved"],
      ["unsaved","Unsaved"],
      ["offline","Offline"],
      ["save503","Error 503"],
      ["conflict409","Conflict 409"],
    ];
    assert(available.length===statuses.length+1 && available.includes("normal") &&
      statuses.every(([key])=>available.includes(key)),
      "Expected normal and all seven DEMO UI status options, got "+JSON.stringify(available));
    const alert=map("SIMULATED.STATUS");
    assert(await alert.count()===0,"Normal status has false error alert");
    for (const [name,label] of statuses) {
      await selector.selectOption(name);
      await visible(alert);
      const text=(await alert.innerText()).toLocaleLowerCase("vi-VN");
      assert(text.includes(label.toLocaleLowerCase("vi-VN")) &&
        text.includes("trạng thái demo") && text.includes("không gọi api"),
        "DEMO status lacks explicit label or simulation/no-API disclosure for "+name+": "+text);
      assert((await alert.getAttribute("class")||"").split(/\s+/).includes(name),
        "DEMO status styling lacks selected state class "+name);
      assert(await map("DEMO.STATUS").isVisible(),"Header DEMO badge vanished in "+name);
      await shot(variant,"status-"+name);
      await map("STATUS.DISMISS").click();
      assert(await alert.count()===0 && await selector.inputValue()==="normal",
        "Status dismiss did not reset "+name+" to normal");
    }
    check("All eight selector states: normal plus seven distinct visible DEMO/no-API notices and dismiss");
    report.cases.push({variant,viewport:"1440x900",area:"status",status:"PASS",
      tested:statuses.map(([name])=>name)});
  };
  try {
    for (const variant of ["A","B"]) {
      await palette(variant);
      await canvasEmpty(variant);
      await nodeMenu(variant);
      await inspector(variant);
      await libraryFiltering(variant);
      await projectCrud(variant);
      await statusScenarios(variant);
      // Responsive evidence uses the exact same 390x844 viewport for both A and B.
      await palette(variant,390,844);
      await inspector(variant,390,844);
      await libraryAssets(variant,390,844);
    }
    safe();
    // Required baseline: palette(3)+Canvas empty(1)+node menu(1)+Inspector(1)+Library grid(1)
    // +search/empty(2)+dialog create/rename/trash(3)+seven DEMO statuses(7)
    // +mobile palette(3)+mobile Inspector(1)+mobile Library(1) = 24 per A/B = 48.
    const expectedImages=48;
    assert(report.screenshots.length===expectedImages &&
      new Set(report.screenshots).size===expectedImages,
      "Incomplete/duplicate screenshot filenames: "+report.screenshots.length+"/"+expectedImages);
    report.screenshotCount=report.screenshots.length;
    assert(report.unimplemented.length===0,"Missing UI cases: "+JSON.stringify(report.unimplemented));
    report.result="PASS";
    report.qaScope="All eight selectable statuses and all menu/library browser assertions PASS";
    return report;
  } catch (error) {
    throw Error("UI-02 Command 4 QA FAILED at "+phase+"; "+report.screenshots.length+
      " screenshots written; "+(error?.message||String(error)));
  } finally {
    page.off("request",beforeRequest);
    page.off("websocket",beforeWebsocket);
    page.off("pageerror",beforeError);
  }
}
