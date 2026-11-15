// UI-02 reference-direction visual/functional Chromium QA. DEV preview ONLY.
// Reuse the prime-owned, already opened Playwright CLI session ui02shell2:
// cd /kkk && npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-reference-qa.js
// Do not invoke a separate browser, server, production APIs or SQLite.
async (page) => {
  const outDir = "docs/evidence/ui02/reference";
  const screenshots = [], checks = [], graphProbes = [], videoPlayback = [];
  const apiCalls = [], pageErrors = [], appSockets = [];
  let hmrSockets = 0, phase = "setup";
  const assert = (ok, message) => { if (!ok) throw Error(message); };
  const initial = new URL(page.url());
  assert(/^https?:$/.test(initial.protocol) && ["A", "B"].includes(initial.searchParams.get("designPreview")),
    "Run from existing Playwright A/B DEV preview in ui02shell2 (e.g. http://127.0.0.1:5193/?designPreview=A)");
  const origin = initial.origin;
  const isApplicationApi = raw => /\/(?:api|graphql|socket\.io|ws)(?:\/|$)/i.test(new URL(raw).pathname);
  const onError = err => pageErrors.push(String(err.message || err));
  const onRequest = request => {
    if (isApplicationApi(request.url())) apiCalls.push({method:request.method(),url:request.url()});
  };
  const onSocket = socket => {
    const url = new URL(socket.url());
    if (url.host === initial.host && url.pathname === "/") hmrSockets++;
    else appSockets.push(socket.url());
  };
  page.on("pageerror", onError);
  page.on("request", onRequest);
  page.on("websocket", onSocket);
  const map = id => page.locator('[data-map-id="AC.UI02.PREVIEW.' + id + '"]');
  const node = id => page.locator('[data-preview-node="' + id + '"]');
  const quick = () => map("QUICKBAR");
  const composer = () => map("COMPOSER");
  const prompt = () => map("COMPOSER.INPUT");
  const check = message => checks.push(message);
  const safe = () => {
    assert(apiCalls.length === 0, "Unexpected application API requests: " + JSON.stringify(apiCalls));
    assert(appSockets.length === 0, "Unexpected application WebSocket: " + JSON.stringify(appSockets));
    assert(pageErrors.length === 0, "Uncaught JS pageerrors: " + JSON.stringify(pageErrors));
  };
  const nav = async (variant, query = "") => {
    await page.goto(origin + "/?designPreview=" + variant + (query ? "&" + query : ""));
    await map("ROOT").waitFor({state:"visible",timeout:8000});
    assert(await page.locator(".referenceDirection.variant" + variant).count() === 1,
      "Expected referenceDirection root variant " + variant);
    assert(await map("MODE." + variant).getAttribute("aria-pressed") === "true",
      "Wrong design variant in reference preview");
    assert(await map("DEMO.STATUS").isVisible(), "In-memory DEMO badge missing");
    safe();
  };
  const atScreen = async screen => {
    const key = screen === "home" ? "HOME.SCREEN" : screen === "canvas" ? "STAGE" : "LIBRARY";
    await map(key).waitFor({state:"visible",timeout:5000});
    assert(await page.locator(".designPreviewRoot").evaluate((el, screenName) =>
      screenName === "home" ? el.classList.contains("showingHome") :
      screenName === "library" ? el.classList.contains("showingLibrary") :
      !el.classList.contains("showingHome") && !el.classList.contains("showingLibrary"),screen),
      "Route did not actually change to " + screen);
  };
  const graph = async (countNodes, countEdges, stage) => {
    try {
      await page.waitForFunction(([expectedNodes,expectedEdges]) => {
        const nodes = [...document.querySelectorAll(".vue-flow__node")];
        const edges = [...document.querySelectorAll(".vue-flow__edge")];
        return nodes.length === expectedNodes && edges.length === expectedEdges &&
          new Set(nodes.map(el=>el.getAttribute("data-id"))).size === nodes.length &&
          new Set(edges.map(el=>el.getAttribute("data-id"))).size === edges.length &&
          edges.every(el => {
            const path=el.querySelector(".vue-flow__edge-path")?.getAttribute("d");
            return path && path.startsWith("M") && path.length>18 && !/NaN|undefined/.test(path);
          });
      },[countNodes,countEdges],{timeout:12000});
    } catch {
      const actual = await page.locator(".vue-flow__edge").evaluateAll(els=>
        els.map(el=>({id:el.getAttribute("data-id"),d:el.querySelector(".vue-flow__edge-path")?.getAttribute("d")})));
      throw Error(stage+": graph mismatch expecting "+countNodes+"/"+countEdges+
        "; actual SVG edges "+JSON.stringify(actual));
    }
    const summary = await page.locator(".previewCanvasInfo strong").innerText();
    assert(summary.includes(countNodes+" node · "+countEdges+" kết nối"),
      stage+": graph summary does not match SVG: "+summary);
    graphProbes.push({stage,nodes:countNodes,edges:countEdges});
  };
  const seeded = async (seven = false) => {
    const ids=seven?["preview-text-01","preview-image-01","preview-video-01",
      "preview-text-02","preview-image-02","preview-image-03","preview-video-02"]:
      ["preview-text-01","preview-image-01","preview-video-01"];
    const edgeIds=seven?["preview-edge-01","preview-edge-02","preview-edge-03",
      "preview-edge-04","preview-edge-05"]:
      ["preview-edge-01","preview-edge-02","preview-edge-03"];
    await graph(ids.length,edgeIds.length,(seven?"7":"3")+"-node seeded");
    for (const id of ids) assert(await node(id).count()===1,"Missing seeded node "+id);
    for (const id of edgeIds) assert(await page.locator('.vue-flow__edge[data-id="'+id+'"]').count()===1,
      "Missing original connected edge "+id);
    check("seed nodes/real VueFlow connections "+ids.length+"/"+edgeIds.length);
  };
  const viewportFit = async (width,height,withComposer=false) => {
    const widthOverflow = await page.evaluate(() => ({
      html: document.documentElement.scrollWidth - innerWidth,
      root: document.querySelector(".designPreviewRoot").scrollWidth -
        document.querySelector(".designPreviewRoot").clientWidth
    }));
    assert(widthOverflow.html <= 2 && widthOverflow.root <= 2,
      width+"x"+height+": document/root horizontal overflow "+JSON.stringify(widthOverflow));
    if (!await map("STAGE").count()) return;
    for (const selector of [".previewCanvasToolbar", ".previewCanvasQuickBar",
      ...(withComposer?[".previewComposer"]:[])]) {
      const el=page.locator(selector);
      assert(await el.isVisible(),selector+" not visible at "+width);
      const rect=await el.boundingBox();
      assert(rect && rect.width>20 && rect.height>20 &&
        rect.x>=-2 && rect.x+rect.width<=width+2 &&
        rect.y>=-2 && rect.y+rect.height<=height+2,
        selector+" escaped "+width+"x"+height+": "+JSON.stringify(rect));
      if (selector===".previewComposer") {
        const overflow=await el.evaluate(e=>e.scrollWidth-e.clientWidth);
        assert(overflow<=2,"Composer contents overflow horizontally at "+width+": "+overflow);
      }
    }
    check(width+"x"+height+": no document horizontal overflow; toolbar, quickbar"+
      (withComposer?", composer":"")+" bounded");
  };
  const shot = async (variant,section,width,height) => {
    const path=outDir+"/"+variant+"-"+section+"-"+width+"x"+height+".png";
    await page.screenshot({path,fullPage:false,animations:"disabled"});
    screenshots.push(path);
    safe();
  };
  const transform = async () => page.locator(".vue-flow__transformationpane").evaluate(el => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return {x:m.m41,y:m.m42,z:m.a};
  });
  const canvasZoomPanFit = async () => {
    const before=await transform();
    await map("ZOOM.IN").click();
    await page.waitForFunction(old => {
      const el=document.querySelector(".vue-flow__transformationpane");
      return el && new DOMMatrixReadOnly(getComputedStyle(el).transform).a>old+.01;
    },before.z,{timeout:3000});
    const zoomed=await transform();
    await map("ZOOM.OUT").click();
    await page.waitForFunction(old => {
      const el=document.querySelector(".vue-flow__transformationpane");
      return el && new DOMMatrixReadOnly(getComputedStyle(el).transform).a<old-.01;
    },zoomed.z,{timeout:3000});
    await page.waitForTimeout(200);
    const pane=page.locator(".vue-flow__pane");
    const target=await pane.evaluate(el => {
      const b=el.getBoundingClientRect();
      for (const [fx,fy] of [[.72,.79],[.14,.76],[.85,.48],[.12,.52],[.56,.88]]) {
        const x=b.left+b.width*fx,y=b.top+b.height*fy;
        for (const [dx,dy] of [[65,-24],[-65,24]]) {
          if (document.elementFromPoint(x,y)===el &&
              document.elementFromPoint(x+dx,y+dy)===el) return {x,y,dx,dy};
        }
      }
      return null;
    });
    assert(target,"No actual unobstructed pane spot for mouse pan");
    const p0=await transform();
    await page.mouse.move(target.x,target.y);
    await page.mouse.down();
    await page.mouse.move(target.x+target.dx,target.y+target.dy,{steps:14});
    await page.mouse.up();
    const p1=await transform();
    assert(Math.hypot(p1.x-p0.x,p1.y-p0.y)>12,
      "Real pointer pan did not change Canvas transform");
    await map("FIT").click();
    await page.waitForTimeout(330);
    assert(Math.hypot((await transform()).x-p1.x,(await transform()).y-p1.y)>8,
      "Fit toolbar did not reframe a panned Canvas");
    check("top toolbar Zoom+/Zoom-/Fit and real mouse canvas pan");
  };
  const realVideo = async variant => {
    const player=node("preview-video-01").locator("video[controls]");
    await player.waitFor({state:"visible",timeout:5000});
    const measure=await player.evaluate(async video => {
      const src=video.currentSrc||video.src, poster=video.getAttribute("poster");
      let error="",playing=false,start=video.currentTime,end=video.currentTime,paused=false;
      try {
        await Promise.race([video.play(),new Promise((_,reject)=>
          setTimeout(()=>reject(Error("local WebM play timeout")),4200))]);
        playing=!video.paused;
        start=video.currentTime;
        await new Promise(resolve=>setTimeout(resolve,1100));
        end=video.currentTime;
      } catch(e) { error=String(e?.message||e); }
      finally { video.pause(); paused=video.paused; }
      return {src,poster,readyState:video.readyState,playing,start,end,paused,error};
    });
    measure.variant=variant;
    videoPlayback.push(measure);
    assert(measure.src.endsWith("/designPreview/flower-cc0.webm") &&
      measure.poster?.endsWith("/designPreview/flowerFrame.svg") &&
      !measure.error && measure.playing && measure.end>measure.start+.06 && measure.paused &&
      measure.readyState>=2,
      "Local real CC0 WebM Play/Pause failed: "+JSON.stringify(measure));
    check(variant+": real CC0 local WebM clock advance/play/pause");
  };
  const testHome = async (variant,width,height) => {
    phase=variant+" "+width+": home layout/navigation";
    await nav(variant,"screen=home");
    await atScreen("home");
    assert(await page.locator(".homeSidebar").isVisible() &&
      await page.locator(".homeWelcome h1").isVisible() &&
      await map("HOME.CREATE").isVisible(),"Real Home sidebar, hero or welcome missing");
    assert((await page.locator(".homeSidebar .homeSidebarItem").allTextContents()).length===6,
      "Home sidebar must expose Tổng, Dự án, Canvas, Tạo ảnh/video, Viết ý tưởng");
    const shortcut=page.locator(".homeShortcutGrid .homeShortcutButton");
    const labels=(await shortcut.allTextContents()).map(s=>s.trim());
    const expected=["Ghi chú","Tạo hình ảnh","Tạo video","Canvas","7 phân cảnh",
      "Prompt","Dự án","Media DEMO"];
    assert(shortcut && labels.length===8 && expected.every(label=>labels.includes(label)),
      "Home must have all 8 working shortcut labels: "+JSON.stringify(labels));
    assert(await page.locator(".homeRecentCard").count()===3,
      "Home recent projects must reflect 3 in-memory seed cards");
    await viewportFit(width,height);
    await shot(variant,"home",width,height);
    check(variant+" "+width+": real Home sidebar/hero, 8 shortcut labels, recent projects");
    await map("HOME.CREATE").click();
    await atScreen("canvas");
    await page.locator(".vue-flow").waitFor({state:"visible",timeout:7000});
    await map("EMPTY").waitFor({state:"visible",timeout:7000});
    await graph(0,0,"Home hero starts truly empty Canvas");
    assert(await composer().isVisible(),"Home hero did not open global composer");
    await map("COMPOSER.CLOSE").click();
    assert(await composer().count()===0,"Home hero composer Close button not functional");
    await map("NAV.HOME").click();
    await atScreen("home");
    // Verify sidebar navigation and real hero shortcuts, not cosmetic controls.
    await page.locator(".homeSidebarItem").filter({hasText:"Dự án"}).click();
    await atScreen("library");
    assert(await page.locator(".previewProjectCard").count()===3,
      "Home sidebar Dự án did not navigate to live Library");
    await map("NAV.HOME").click();
    await atScreen("home");
    await page.locator(".homeSidebarItem").filter({hasText:"Canvas"}).click();
    await atScreen("canvas");
    await map("NAV.HOME").click();
    await atScreen("home");
    check(variant+": Hero creates empty Canvas/Composer and sidebar routes Home/Library/Canvas");
  };
  const testEightHomeShortcuts = async variant => {
    phase=variant+": eight real Home shortcut actions";
    const actions=[
      ["Ghi chú","text"],["Tạo hình ảnh","image"],["Tạo video","video"],
      ["Canvas","canvas"],["7 phân cảnh","seven"],["Prompt","composer"],
      ["Dự án","library"],["Media DEMO","media"],
    ];
    for (const [label,behavior] of actions) {
      await nav(variant,"screen=home");
      const button=page.locator(".homeShortcutGrid .homeShortcutButton").filter({hasText:label});
      assert(await button.count()===1,variant+": missing unique Home shortcut "+label);
      await button.click();
      if (behavior==="library") {
        await atScreen("library");
        assert(await page.locator(".previewProjectCard").count()===3,
          "Home Dự án shortcut failed to show real seed cards");
      } else {
        await atScreen("canvas");
        if (behavior==="seven") await seeded(true);
        else if (behavior==="composer") {
          await composer().waitFor({state:"visible"});
          assert(await prompt().evaluate(el=>document.activeElement===el),
            "Home Prompt shortcut did not focus composer input");
        } else if (behavior==="text" || behavior==="image" || behavior==="video") {
          await graph(4,3,label+" adds exactly one genuine VueFlow node");
          const added=page.locator('[data-preview-node^="preview-'+behavior+'-added-"]');
          assert(await added.count()===1,"Home "+label+" shortcut did not add the proper real node type");
          if (behavior==="video") assert(await added.locator("video[controls]").count()===1,
            "New Video node missing native media controls");
        } else if (behavior==="media") {
          await seeded(false);
          assert(await map("MEDIA").inputValue()==="compact" &&
            await page.locator(".previewMedia").count()===0 &&
            await page.locator(".previewMediaUnavailable").count()===2,
            "Home Media DEMO shortcut did not toggle actual compact disconnected-state media");
        } else await seeded(false);
      }
      check(variant+": Home shortcut "+label+" performed real "+behavior+" action");
    }
  };
  const testQuickbar = async variant => {
    phase=variant+": 8 working Canvas Quickbar actions";
    await nav(variant);
    await atScreen("canvas");
    await seeded(false);
    assert(await map("TOOLBAR").isVisible(),"Original Canvas zoom/fit/add toolbar missing");
    const buttons=quick().locator("button");
    assert(await quick().isVisible() && await buttons.count()===8,
      "Canvas Quickbar must have exactly 8 genuine interactive buttons");
    await quick().getByRole("button",{name:"Mở bảng thêm node"}).click();
    await map("PALETTE").waitFor({state:"visible"});
    assert(await map("ADD.TEXT").count()===1 &&
      await map("ADD.IMAGE").count()===1 &&
      await map("ADD.VIDEO").count()===1,
      "Quickbar Add failed to show three real palette actions");
    await map("PALETTE.CLOSE").click();
    assert(await map("PALETTE").count()===0,"Quickbar Palette Close did not work");
    await canvasZoomPanFit();
    const preQuickZoom=await transform();
    await map("ZOOM.IN").click();
    await page.waitForFunction(old => {
      const el=document.querySelector(".vue-flow__transformationpane");
      return el && new DOMMatrixReadOnly(getComputedStyle(el).transform).a>old+.01;
    },preQuickZoom.z,{timeout:3000});
    const beforeQuickFit=await transform();
    await quick().getByRole("button",{name:"Vừa toàn bộ workflow vào khung"}).click();
    await page.waitForTimeout(330);
    const afterQuickFit=await transform();
    assert(afterQuickFit.z<beforeQuickFit.z-.01,
      "Quickbar Fit did not actually reframe after Zoom In: "+
      JSON.stringify({beforeQuickFit,afterQuickFit}));
    await seeded(false);
    await quick().getByRole("button",{name:"Thêm Text Node"}).click();
    await graph(4,3,"Quickbar added Text");
    assert(await page.locator('[data-preview-node^="preview-text-added-"]').count()===1,
      "Quickbar Text added no genuine node");
    await quick().getByRole("button",{name:"Thêm Image Node"}).click();
    await graph(5,3,"Quickbar added Image");
    assert(await page.locator('[data-preview-node^="preview-image-added-"]').count()===1,
      "Quickbar Image added no genuine node");
    await quick().getByRole("button",{name:"Thêm Video Node"}).click();
    await graph(6,3,"Quickbar added Video");
    assert(await page.locator('[data-preview-node^="preview-video-added-"] video[controls]').count()===1,
      "Quickbar Video node missing real HTML5 controls");
    await quick().getByRole("button",{name:"Chuyển Compact và Media DEMO"}).click();
    assert(await map("MEDIA").inputValue()==="compact" &&
      await page.locator(".previewMedia").count()===0,
      "Quickbar compact action did not hide real DEMO media");
    await quick().getByRole("button",{name:"Chuyển Compact và Media DEMO"}).click();
    assert(await map("MEDIA").inputValue()==="demo" &&
      await page.locator(".previewMedia").count()>=2,
      "Quickbar DEMO restore action did not restore media");
    await quick().getByRole("button",{name:"Xem workflow 7 node"}).click();
    await seeded(true);
    await quick().getByRole("button",{name:"Mở khung nhập Canvas"}).click();
    await composer().waitFor({state:"visible"});
    await map("COMPOSER.CLOSE").click();
    assert(await composer().count()===0,"Quickbar Composer toggle and Close did not work");
    check(variant+": all 8 Quickbar actions executed; original toolbar preserved; true pan/zoom/fit");
  };
  const testComposer = async (variant,width,height) => {
    phase=variant+" "+width+": real composer refs, kind, aspect, create/update";
    await nav(variant,"scenario=seven");
    await atScreen("canvas");
    await seeded(true);
    await map("FIT").click();
    await page.waitForTimeout(300);
    await viewportFit(width,height);
    await shot(variant,"canvas7",width,height);
    await realVideo(variant+"-"+width);
    await quick().getByRole("button",{name:"Mở khung nhập Canvas"}).click();
    await composer().waitFor({state:"visible"});
    assert(await prompt().evaluate(el=>document.activeElement===el),
      "Composer did not focus prompt field");
    assert(await map("COMPOSER.SUBMIT").isDisabled(),
      "Empty global composer prompt must not submit");
    const draft="QA giữ nội dung khi Escape - "+variant+" "+width;
    await prompt().fill(draft);
    await prompt().press("Escape");
    assert(await composer().count()===0,"Escape did not dismiss global composer");
    await quick().getByRole("button",{name:"Mở khung nhập Canvas"}).click();
    await composer().waitFor({state:"visible"});
    assert(await prompt().inputValue()===draft,"Escape discarded draft composer text");
    await map("COMPOSER.CLOSE").click();
    await quick().getByRole("button",{name:"Mở khung nhập Canvas"}).click();
    assert(await prompt().inputValue()===draft,"Close/reopen lost unsubmitted composer draft");
    const picker=composer().locator(".composerIconButton[title='Chọn ảnh DEMO làm tham chiếu']");
    await picker.click();
    const preset=composer().locator(".composerReferencePicker > button");
    assert(await preset.count()===3,"Global composer must offer three truthful local preset SVG references");
    await preset.first().click();
    assert(await composer().locator(".composerReferenceCard").count()===1,
      "Choosing preset reference did not add a real chip/image");
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50"><rect width="80" height="50" fill="#39485f"/><circle cx="40" cy="25" r="12" fill="#dedede"/></svg>';
    // Playwright CLI opens an interactive file-chooser handler on button.click().
    // Upload directly through the genuine, existing hidden HTML input instead:
    // no modal, still exercises the application's native change/upload handler.
    const uploadInput=composer().locator('input[type="file"][accept="image/*"]');
    assert(await uploadInput.count()===1 &&
      await uploadInput.evaluate(el=>el instanceof HTMLInputElement &&
        el.type==="file" && el.multiple && el.accept==="image/*"),
      "Composer must expose one real multiple image/* file input");
    await uploadInput.setInputFiles({name:"reference-qa.svg",
      mimeType:"image/svg+xml",buffer:Buffer.from(svg,"utf8")});
    assert(await composer().locator(".composerReferenceCard").count()===2,
      "Actual local image upload failed to create preview reference");
    await page.waitForFunction(() => {
      const images=[...document.querySelectorAll(".previewComposer .composerReferenceCard img")];
      return images.length===2 && images.every(img=>img.complete && img.naturalWidth>0);
    },null,{timeout:4000});
    const references=await composer().locator(".composerReferenceCard img").evaluateAll(imgs=>
      imgs.map(img=>({src:img.currentSrc,loaded:img.complete && img.naturalWidth>0})));
    assert(references.length===2 && references.every(img=>img.loaded) &&
      references.some(img=>img.src.startsWith("blob:")) &&
      references.some(img=>img.src.includes("/designPreview/")),
      "Local upload + SVG preset were not both decoded and visible: "+JSON.stringify(references));
    const remove=composer().locator(".composerReferenceCard button").first();
    assert((await remove.getAttribute("aria-label"))?.startsWith("Xóa tham chiếu"),
      "Composer reference removal must be a labeled working button");
    await remove.click();
    assert(await composer().locator(".composerReferenceCard").count()===1,
      "Remove reference failed or removed every reference instead of one");
    await picker.click();
    await preset.nth(1).click();
    assert(await composer().locator(".composerReferenceCard").count()===2 &&
      await prompt().inputValue()===draft,
      "Re-adding a preset after removing one lost uploaded reference or draft text");
    const marker=composer().locator(".composerIconButton[title='Đánh dấu cảnh để nhận biết trong prompt']");
    await marker.click();
    assert(await marker.getAttribute("aria-pressed")==="true",
      "Real composer scene marker did not toggle");
    await marker.click();
    assert(await marker.getAttribute("aria-pressed")==="false","Composer marker cannot toggle off");
    const kind=map("COMPOSER.KIND");
    const ratio=composer().getByRole("combobox",{name:"Chọn tỷ lệ khung hình"});
    assert(JSON.stringify(await kind.locator("option").evaluateAll(els=>els.map(e=>e.value)))===
        JSON.stringify(["image","video","text"]),
      "Composer kind list must allow Image/Video/Text");
    assert(JSON.stringify(await ratio.locator("option").evaluateAll(els=>els.map(e=>e.value)))===
        JSON.stringify(["16:9","1:1","9:16"]),
      "Composer ratio list must allow 16:9, 1:1, 9:16");
    await kind.selectOption("image");
    await ratio.selectOption("9:16");
    const createText="QA reference composer "+variant+" "+width+
      " — portrait 9:16 (DEMO; no AI output)";
    await prompt().fill(createText);
    assert(!await map("COMPOSER.SUBMIT").isDisabled() &&
      (await map("COMPOSER.SUBMIT").innerText()).includes("Thêm vào Canvas"),
      "Composer enabled create action not truthful");
    await viewportFit(width,height,true);
    await shot(variant,"composer",width,height);
    await map("COMPOSER.SUBMIT").click();
    assert(await composer().count()===0,"Create Composer did not close after Submit");
    await graph(8,5,"Composer creates one real Image, preserves original five edges");
    const added=page.locator('[data-preview-node^="preview-image-added-"]');
    assert(await added.count()===1,"Composer create failed to insert exactly one Image node");
    assert((await added.locator(".previewPromptSummary").getAttribute("title"))===createText,
      "New Image node lost submitted prompt");
    assert(await added.locator(".previewImageMedia").getAttribute("data-aspect")==="9:16",
      "Composer aspect ratio 9:16 was not applied to the new Image node");
    assert(await map("INSPECTOR").count()===0,
      "Successful composer Submit must close Inspector instead of leaving blocking overlay");
    await node("preview-text-01").locator(".previewNodeHeader").click();
    await page.waitForFunction(()=>
      document.querySelector('[data-preview-node="preview-text-01"]')?.closest(".vue-flow__node")?.classList.contains("selected"),
      null,{timeout:3000});
    await quick().getByRole("button",{name:"Mở khung nhập Canvas"}).click();
    assert((await map("COMPOSER.SUBMIT").innerText()).includes("Cập nhật"),
      "Selecting a node did not switch composer from Create to Update");
    const updateText="QA update selected note - "+variant+" "+width;
    await prompt().fill(updateText);
    await map("COMPOSER.SUBMIT").click();
    assert(await node("preview-text-01").locator(".previewTextInput").inputValue()===updateText,
      "Update Composer did not propagate real prompt into selected Text node");
    await graph(8,5,"Updating selected node must not add an extra node or delete edges");
    check(variant+" "+width+": upload + SVG preset, remove/mark, Escape/Close retention, kind/ratio, Create vs Update");
    safe();
  };
  try {
    for (const variant of ["A","B"]) {
      for (const [width,height] of [[1440,900],[390,844]]) {
        await page.setViewportSize({width,height});
        await testHome(variant,width,height);
        if (width===1440) {
          await testEightHomeShortcuts(variant);
          await testQuickbar(variant);
        } else {
          // Mobile must still expose all 8 operational quickbar buttons; desktop
          // has already exercised each action with the real Vue app.
          await nav(variant,"scenario=three");
          await atScreen("canvas");
          assert(await quick().locator("button").count()===8,
            "Mobile Quickbar lost any of its 8 real actions");
        }
        await testComposer(variant,width,height);
      }
    }
    safe();
    const expected=[];
    for (const variant of ["A","B"]) for (const [w,h] of [[1440,900],[390,844]])
      for (const screen of ["home","canvas7","composer"])
        expected.push(outDir+"/"+variant+"-"+screen+"-"+w+"x"+h+".png");
    assert(expected.length===12 && screenshots.length===12 &&
      new Set(screenshots).size===12 && expected.every(path=>screenshots.includes(path)),
      "Must write EXACTLY 12 distinct screenshot names: "+JSON.stringify({expected,screenshots}));
    assert(videoPlayback.length===4 && videoPlayback.every(item=>
      !item.error && item.playing && item.paused && item.end>item.start+.06),
      "Local CC0 video not genuinely played and paused for all desktop/mobile A/B");
    return {result:"PASS — REFERENCE-DIRECTION TECHNICAL DEV PREVIEW ONLY",
      screenshots,count:screenshots.length,checks,checkCount:checks.length,
      graphProbes,graphProbeCount:graphProbes.length,videoPlayback,
      apiCalls,appSockets,pageErrors,hmrSockets,
      note:"In-memory DEMO only; no AI/API/SQLite; visual approval remains owner-pending"};
  } catch (error) {
    throw Error("UI-02 REFERENCE QA FAILED at "+phase+" after "+screenshots.length+
      "/12 screenshots: "+String(error?.message||error));
  } finally {
    page.off("pageerror",onError);
    page.off("request",onRequest);
    page.off("websocket",onSocket);
  }
}
