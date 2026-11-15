// UI-02 A/B browser screenshot QA. Requires Vite dev port 5173, no backend.
// Use playwright CLI 1.65.1 run-code --filename scripts/ui02-design-preview-qa.js
async (page) => {
  const root = "docs/evidence/ui02/review-";
  const shots = [], errors = [], apiCalls = [];
  const onError = error => errors.push(error.message);
  const onRequest = request => { if (/\/api(?:\/|$)/.test(new URL(request.url()).pathname)) apiCalls.push(request.url()); };
  page.on("pageerror", onError); page.on("request", onRequest);
  const assert = (pass, message) => { if (!pass) throw Error(message); };
  const map = id => page.locator('[data-map-id="' + id + '"]');
  const shot = async (variant, name) => {
    const path = root + variant + "/" + name + ".png";
    await page.screenshot({ path, fullPage: true, animations: "disabled" });
    shots.push(path);
  };
  const goto = async (variant, query) => {
    await page.goto("http://127.0.0.1:5173/?designPreview=" + variant + (query ? "&" + query : ""));
    await map("AC.UI02.PREVIEW.ROOT").waitFor({state:"visible"});
  };
  const selectNode = async id => {
    const node = page.locator('[data-preview-node="' + id + '"]');
    await node.locator(".previewNodeHeader").click();
    await map("AC.UI02.PREVIEW.INSPECTOR").waitFor({state:"visible"});
    return node;
  };
  try {
    for (const variant of ["A","B"]) {
      await page.setViewportSize({width:1440,height:900});
      await goto(variant, "screen=library");
      await shot(variant,"01-project-library");
      await page.locator(".previewReviewControls select").selectOption("empty");
      await shot(variant,"02-project-library-empty");
      await goto(variant,"scenario=empty");
      await shot(variant,"03-canvas-empty");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      await map("AC.UI02.PREVIEW.MEDIA").selectOption("compact");
      assert(await page.locator(".previewMedia").count()===0, "Compact state falsely contains media");
      await selectNode("preview-text-01");
      await shot(variant,"04-text-node");
      await selectNode("preview-image-01");
      await shot(variant,"05-image-node-compact");
      await selectNode("preview-video-01");
      await shot(variant,"06-video-node-compact");
      await map("AC.UI02.PREVIEW.MEDIA").selectOption("demo");
      assert(await page.locator(".previewMedia").count()===2, "DEMO media count mismatch");
      await selectNode("preview-image-01");
      await shot(variant,"07-image-node-with-demo-media");
      await selectNode("preview-video-01");
      assert(await page.locator("video[controls]").count()===1, "Video controls missing");
      await shot(variant,"08-video-node-with-demo-media");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      assert(await page.locator(".vue-flow__edge").count()===3, "Three node edges missing");
      await map("AC.UI02.PREVIEW.FIT").click();
      await shot(variant,"09-three-nodes-connected");
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("seven");
      await map("AC.UI02.PREVIEW.FIT").click();
      assert(await page.locator("[data-preview-node]").count()===7,"7 node state missing");
      await shot(variant,"10-seven-nodes-workflow");
      const image = await selectNode("preview-image-01");
      await shot(variant,"11-node-selected");
      assert(await map("AC.UI02.PREVIEW.NODE.TOOLBAR").count()===1,"Context toolbar missing");
      await shot(variant,"12-node-context-toolbar");
      await image.locator(".nodeMore").click();
      assert(await image.locator(".previewNodeMenu").isVisible(),"Node menu missing");
      await shot(variant,"13-node-menu");
      await image.locator(".nodeMore").click();
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await map("AC.UI02.PREVIEW.TOOLBAR").locator(".previewCreateButton").click();
      const search = map("AC.UI02.PREVIEW.PALETTE").locator("input[type=search]");
      await search.fill("video");
      assert(await map("AC.UI02.PREVIEW.ADD.VIDEO").count()===1 && await map("AC.UI02.PREVIEW.ADD.TEXT").count()===0,"Palette filter broken");
      await search.fill("");
      await shot(variant,"14-node-palette");
      await page.keyboard.press("Escape");
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
      await shot(variant,"18-right-edge-node-selected");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("save503");
      assert((await map("AC.UI02.PREVIEW.SIMULATED.STATUS").innerText()).includes("KHÔNG GỌI API"),"Simulated status not identified");
      await shot(variant,"19-save-error");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("conflict409");
      await shot(variant,"20-revision-conflict");
      await map("AC.UI02.PREVIEW.STATUS").selectOption("normal");
      await map("AC.UI02.PREVIEW.INSPECTOR.CLOSE").click();
      await map("AC.UI02.PREVIEW.SCENARIO").selectOption("three");
      for (const [width,height] of [[1920,1080],[1280,800],[1024,768],[390,844]]) {
        await page.setViewportSize({width,height});
        await map("AC.UI02.PREVIEW.FIT").click();
        await shot(variant,"responsive-canvas-"+width+"x"+height);
        const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
        assert(overflow<3,"Document overflow at "+width+": "+overflow);
        await page.locator(".previewTopAction").click();
        await shot(variant,"responsive-library-"+width+"x"+height);
        await page.locator(".previewTopAction").click();
      }
      await page.setViewportSize({width:1440,height:900});
      await page.locator(".previewTopAction").click();
      await page.getByRole("button",{name:"Tạo dự án mẫu"}).click();
      await page.locator(".previewDialog[open] input").fill("Dự án kiểm tra UI-02");
      await page.locator(".previewDialog[open] .previewPrimaryButton").click();
      assert((await page.locator(".previewProjectGrid").innerText()).includes("Dự án kiểm tra UI-02"),"In-memory create failed");
      assert(apiCalls.length===0, "Preview sent API call");
    }
    assert(errors.length===0,"JS errors: "+errors.join("; "));
    return {result:"PASS",screenshots:shots,count:shots.length,apiCalls,errors};
  } finally { page.off("pageerror",onError); page.off("request",onRequest); }
}