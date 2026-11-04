// Help navigation must retain the document URL, including the file snapshot's different asset base.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const docs = path.join(root, 'docs'), output = path.join(root, 'tmp/help-navigation');
await fs.mkdir(output, {recursive:true});
const server = http.createServer(async (req,res) => {
  try {
    const target = path.resolve(docs, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!target.startsWith(docs + path.sep)) throw Error('Outside docs');
    const bytes = await fs.readFile(target);
    res.writeHead(200, {'Content-Type': {'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json'}[path.extname(target)] || 'application/octet-stream'}); res.end(bytes);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true});
const results=[];
try {
  for (const url of [pathToFileURL(path.join(docs,'file/index.html')).href, `http://127.0.0.1:${server.address().port}/index.html`]) {
    const page = await browser.newPage({viewport:{width:1280,height:900}}), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // This test isolates Help; model loading is covered by test.mjs.
    await page.route('**/*',route=> /\/model\/(micro|neural)\/|cdn\.jsdelivr\.net/.test(route.request().url()) ? route.abort() : route.continue());
    await page.goto(url);
    await page.waitForFunction(()=>window.SketchpadInfo);
    const state = async(open,id) => {
      await page.waitForFunction(({open,id})=>DocsKit.isOpen()===open && (!id || DocsKit.current()===id), {open,id});
      assert.equal(await page.locator('#docs').isVisible(),open);
      assert.equal(await page.locator('.app').evaluate(e=>e.inert),open);
      assert.equal(await page.evaluate(()=>location.href.split('#')[0]),url);
    };
    await page.locator('#help-btn').click(); await state(true,'start');
    const pages = await page.evaluate(()=>DocsKit.pages.map(p=>p.id));
    for(const id of pages) {
      await page.locator(`#docs-nav a[href="#help/${id}"]`).click(); await state(true,id);
      assert.equal(await page.locator('#docs-page .errt').count(),0,id);
    }
    await page.locator('#docs-close').click(); await state(false);
    await page.locator('#help-btn').click(); await state(true,'start');
    await page.locator('#docs-nav a[href="#help/using"]').click(); await state(true,'using');
    await page.locator('#docs-back').click(); await state(true,'start');
    await page.keyboard.press('Escape'); await state(false);
    await page.goForward(); await state(true,'start');
    await page.locator('#docs-close').click(); await state(false);
    await page.goto(url+'#help/start/replies');
    await page.waitForFunction(()=>window.SketchpadInfo); await state(true,'using');
    await page.locator('#docs-close').click(); await state(false);
    assert.equal(await page.evaluate(()=>location.hash),'');
    await page.locator('#open-examples').click();
    await page.locator('[data-sc="house"][data-how="step"]').click();
    await page.locator('[data-rtab="expected"]').click();
    for(const sub of ['drawing','sop','text']) {
      await page.locator(`[data-sub="${sub}"]`).click();
      await page.locator('#help-btn').click(); await state(true,'start');
      await page.locator('#docs-close').click(); await state(false);
      assert.equal(await page.locator('#rtabs [aria-selected="true"]').getAttribute('data-rtab'),'expected');
      assert.equal(await page.locator('#subtabs [aria-selected="true"]').getAttribute('data-sub'),sub);
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('#help-btn').click(); await state(true,'start');
    await page.locator('#docs-menu-btn').click();
    await page.locator('#docs-nav a[href="#help/using"]').click(); await state(true,'using');
    await page.screenshot({path:path.join(output,url.startsWith('file:')?'file-help.png':'http-help.png')});
    await page.locator('#docs-close').click(); await state(false);
    assert.deepEqual(errors,[]);
    results.push({protocol:new URL(url).protocol,pages:pages.length,errors});
    await page.close();
  }
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
  console.log('PASS: file:// and HTTP Help, every page, history, close, Escape, deep links, Expected subtabs, and mobile navigation.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
