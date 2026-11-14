// UI-02 additional state and boundary QA. Run AFTER ui02-visual-qa.js on isolated 5184/3114.
// Actual browser, actual SQLite; only 503/health failures are intentionally simulated.
async(page)=>{
 const root='docs/evidence/ui02';const webUrl='http://127.0.0.1:5184/';
 const map=id=>page.locator(`[data-map-id="${id}"]`);
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const snaps=[];const errors=[];
 const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const shot=async name=>{await page.screenshot({path:`${root}/${name}.png`,fullPage:true});snaps.push(name)};
 try{
  await page.setViewportSize({width:1440,height:900});await page.goto(webUrl);await map('AC.HOME').waitFor();
  const list=await page.evaluate(async()=> (await(await fetch('/api/projects')).json()).projects);
  const project=list.filter(p=>p.name.startsWith('UI02 ')&&p.name.includes('Phim ngắn')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];
  assert(project?.id,'Run UI02 visual QA before state QA');
  await page.locator(`[data-map-id="AC.HOME.OPEN"][data-project-id="${project.id}"]`).click();await map('AC.CANVAS').waitFor();
  // One selected Text; node prompt and Inspector must synchronize.
  await map('AC.TEXT.NODE').first().locator('.node-drag-handle').click();await map('AC.UI.INSPECTOR').waitFor();await shot('UI02-text-selected');
  await map('AC.UI.INSPECTOR.CLOSE').click();
  // Long prompt should expand compact media editor without changing node IDs.
  const image=map('AC.IMAGE.NODE').first();
  await image.locator('[data-map-id="AC.UI.NODE.PROMPT.EXPAND"]').click();
  const longPrompt='Khung hình điện ảnh: '.repeat(55)+' ánh nắng qua rèm cửa, hành động tinh tế.';
  await map('AC.IMAGE.PROMPT').first().fill(longPrompt);
  assert(await map('AC.IMAGE.PROMPT').first().inputValue()===longPrompt,'Long prompt content lost');
  await shot('UI02-long-prompt');
  const height=await map('AC.IMAGE.NODE').first().boundingBox();assert(height&&height.height<380,'Expanded node blocks too much Canvas');
  // Real node menu, compact destructive action (no overlay leftovers).
  await image.locator('[data-map-id="AC.UI.NODE.MENU.TOGGLE"]').click();
  assert(await image.locator('[data-map-id="AC.CANVAS.NODE.DELETE"]').isVisible(),'Delete menu command missing');
  await shot('UI02-node-context-menu');
  await image.locator('[data-map-id="AC.UI.NODE.MENU.TOGGLE"]').click();
  assert(await image.locator('[data-map-id="AC.CANVAS.NODE.DELETE"]').count()===0,'Node menu did not close');
  // Inspector must not crop the selected video at the far right, even with 7 nodes.
  const video=map('AC.VIDEO.NODE').first();await video.locator('.node-drag-handle').click();await map('AC.UI.INSPECTOR').waitFor();
  await page.waitForTimeout(450);
  const a=await video.boundingBox(), b=await page.locator('.canvasStage').boundingBox(), c=await map('AC.UI.INSPECTOR').boundingBox();
  assert(a&&b&&c&&a.x>=b.x-1&&a.x+a.width<=b.x+b.width+1&&c.x>=b.x+b.width-2,'Selected right-edge Video is obscured/clipped by Inspector');
  await shot('UI02-inspector-right-edge');
  await map('AC.UI.INSPECTOR.CLOSE').click();
  // Roadmap tools are hidden rather than permanent gray icons.
  await map('AC.UI.ROADMAP.TOGGLE').click();await map('AC.UI.ROADMAP').waitFor();
  assert((await map('AC.UI.ROADMAP').innerText()).includes('Sắp phát triển'),'Roadmap must be truthful');
  await shot('UI02-roadmap-menu');await map('AC.UI.ROADMAP.TOGGLE').click();
  // API disconnected banner/status and recovery via current health UI.
  const health='**/api/health';const rejectHealth=async route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'UI02 test: máy chủ không phản hồi'})});
  await page.route(health,rejectHealth);
  await map('AC.SYSTEM.HEALTH.RETRY').click();await page.waitForFunction(()=>document.querySelector('[data-map-id="AC.SYSTEM.HEALTH"] .statusDot')?.classList.contains('offline'),null,{timeout:12000});
  await shot('UI02-api-disconnected');
  await page.unroute(health,rejectHealth);await map('AC.SYSTEM.HEALTH.RETRY').click();
  await page.waitForFunction(()=>document.querySelector('[data-map-id="AC.SYSTEM.HEALTH"] .statusDot')?.classList.contains('online'),null,{timeout:12000});
  // PUT failure/retry, no actual SQLite failure or user database touched.
  const canvasPath=`/api/projects/${project.id}/canvas`;
  const pattern=`**${canvasPath}`;const rejectSave=async route=>{if(route.request().method()==='PUT')await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,message:'UI02 test: SQLite 503'})});else await route.continue()};
  // First acknowledge previous long prompt before simulating next change.
  await page.waitForFunction(()=>document.querySelector('[data-map-id="AC.CANVAS.SAVE.STATUS"]')?.classList.contains('saved'),null,{timeout:20000});
  await page.route(pattern,rejectSave);
  const previous=await map('AC.TEXT.PROMPT').first().inputValue();
  await map('AC.TEXT.PROMPT').first().fill(previous+' | QA lỗi lưu');
  await map('AC.CANVAS.SAVE.ERROR').waitFor({state:'visible',timeout:16000});
  await shot('UI02-save-error');
  assert((await map('AC.TEXT.PROMPT').first().inputValue()).includes('QA lỗi lưu'),'Draft lost after 503');
  await page.unroute(pattern,rejectSave);await map('AC.CANVAS.SAVE.RETRY').click();
  await page.waitForFunction(async id=>{const r=await fetch(`/api/projects/${id}/canvas`),d=await r.json();return d.canvas?.nodes?.some(n=>n.data.content.includes('QA lỗi lưu'))},project.id,{timeout:16000});
  assert(errors.length===0,'Page errors '+errors.join('|'));
  return {result:'PASS',projectId:project.id,screenshots:snaps,longPrompt:true,nodeMenu:true,inspectorRightEdge:true,health503Retry:true,save503Retry:true,pageErrors:errors};
 }finally{page.off('pageerror',onError)}
}
