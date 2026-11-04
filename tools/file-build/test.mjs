// Real browser checks: default file security, actual models, all menu reference drawings, HTTP compatibility.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), docs = path.join(root, 'docs');
const require = createRequire(import.meta.url), scenarios = require('../../docs/js/scenarios.js');
const output = path.join(root, 'tmp/file-support'); await fs.mkdir(output, { recursive: true });
const results = { scenarios: [], quick: [], pageErrors: [], localFailures: [] };
const server = http.createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(docs, '.' + (relative === '/' ? '/index.html' : relative));
    if (!target.startsWith(docs + path.sep)) { res.writeHead(403); res.end(); return; }
    const data = await fs.readFile(target);
    const type = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css' }[path.extname(target)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type':type, 'Content-Length':data.length }); res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome', headless:true });
async function ready(page) {
  await page.waitForFunction(() => window.SketchpadInfo && [...document.querySelectorAll('[data-rtab]')].length === 4 &&
    [...document.querySelectorAll('[data-rtab]')].every(b => !b.classList.contains('off')) && document.querySelector('#loadov').hidden, { timeout:180000 });
}
async function chooseExpected(page) {
  await page.locator('#rtabs [data-rtab="expected"]').click();
  assert.deepEqual(await page.locator('#subtabs [data-sub]').allTextContents(), ['Drawing', 'SOP Lang', 'Text']);
  assert.equal(await page.locator('#rtabs [aria-selected="true"]').getAttribute('data-rtab'), 'expected');
  await page.waitForSelector('#expected-canvas');
}
try {
  const page = await browser.newPage({ viewport:{width:1440,height:1000} });
  page.on('pageerror', e => results.pageErrors.push(e.message));
  page.on('requestfailed', r => { if (r.url().startsWith('file:')) results.localFailures.push({url:r.url(),error:r.failure()}); });
  await page.goto(pathToFileURL(path.join(docs, 'index.html')).href);
  await page.waitForURL('**/file/index.html'); await ready(page);
  results.fileStartup = 'All four readers ready; all confidence files and the end-to-end first check passed.';
  assert.equal(await page.locator('[data-rtab="expected"]').count(), 0);
  for (const sc of scenarios) {
    await page.locator('#open-examples').click();
    await page.locator(`[data-sc="${sc.id}"][data-how="step"]`).click();
    await chooseExpected(page);
    const shapes = await page.locator('#expected-canvas .shp').count();
    const expectedCount = await page.evaluate(async ({id,turns}) => {
      const catalog = await (await fetch(new URL('examples/reference.json', document.baseURI))).json();
      return ExampleReference.create(catalog, {id,turns}).at(turns.length-1).state.shapes.length;
    }, sc);
    assert.equal(shapes, expectedCount, sc.id);
    assert.equal(await page.locator('#rpanel').getByText('No reader prediction is substituted.',{exact:false}).count(),0,sc.id);
    const before = await page.evaluate(() => ['rules','vss','neural','combined'].map(id => SketchpadInfo.area(id)));
    await page.locator('[data-sub="sop"]').click();
    assert.ok(await page.locator('#rpanel pre.sop').count());
    assert.equal(await page.locator('#expected-canvas').count(),0);
    await page.locator('[data-sub="text"]').click();
    assert.equal(await page.locator('#rpanel > *').count(), 1);
    assert.equal(await page.locator('#rpanel pre.expected-text').textContent(), sc.turns.join('\n\n'));
    assert.equal(await page.locator('#rpanel button').count(), 0);
    await page.locator('[data-sub="drawing"]').click();
    assert.equal(await page.locator('#cfoot').isVisible(), true);
    assert.equal(await page.locator('#tools').isVisible(), true);
    assert.deepEqual(await page.evaluate(() => ['rules','vss','neural','combined'].map(id => SketchpadInfo.area(id))),before);
    if (sc.id === 'house') await page.screenshot({path:path.join(output,'expected-house.png')});
    results.scenarios.push({id:sc.id,steps:sc.turns.length,shapes});
    await page.locator('[data-pl="close"]').click();
    assert.equal(await page.locator('[data-rtab="expected"]').count(),0);
  }
  await page.locator('#open-examples').click();
  const quick = await page.locator('[data-quick]').evaluateAll(nodes => nodes.map(n => n.dataset.quick));
  await page.locator('#close-sheet').click();
  for (let i=0;i<quick.length;i++) {
    await page.locator('#open-examples').click();
    const turn = await page.evaluate(() => SketchpadInfo.turn());
    await page.locator('[data-quick]').nth(i).click();
    await page.waitForSelector(`[data-turn="${turn+1}"]`,{timeout:90000});
    await chooseExpected(page);
    assert.ok(await page.locator('#expected-canvas .shp').count());
    await page.locator('[data-sub="sop"]').click();
    assert.ok(!(await page.locator('#rpanel').innerText()).includes('No saved reference'));
    results.quick.push(quick[i]);
    await page.locator('[data-sub="drawing"]').click();
  }
  // Expected belongs to the main keyboard navigation and stays readable on a phone.
  await page.locator('#open-examples').click(); await page.locator('[data-sc="house"][data-how="step"]').click();
  await chooseExpected(page);
  assert.equal((await page.locator('[data-rtab="expected"]').innerText()).trim(), 'Expected');
  await page.locator('#zoom-fit').click();
  const fitBox = await page.locator('#expected-canvas').getAttribute('viewBox');
  await page.locator('#zoom-in').click();
  assert.notEqual(await page.locator('#expected-canvas').getAttribute('viewBox'), fitBox);
  assert.equal(await page.locator('#zoom-pct').textContent(), '125%');
  await page.locator('#zoom-fit').click();
  assert.equal(await page.locator('#expected-canvas').getAttribute('viewBox'), fitBox);
  const namesBefore = await page.locator('#names-btn').getAttribute('aria-pressed');
  await page.locator('#names-btn').click();
  assert.notEqual(await page.locator('#names-btn').getAttribute('aria-pressed'), namesBefore);
  const namesFitBox = await page.locator('#expected-canvas').getAttribute('viewBox');
  await page.locator('#expected-canvas').focus(); await page.keyboard.press('ArrowRight');
  assert.notEqual(await page.locator('#expected-canvas').getAttribute('viewBox'), namesFitBox);
  await page.keyboard.press('0');
  assert.equal(await page.locator('#expected-canvas').getAttribute('viewBox'), namesFitBox);
  await page.locator('[data-rtab="expected"]').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#rtabs [aria-selected="true"]').getAttribute('data-rtab'),'combined');
  await page.keyboard.press('ArrowLeft'); await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(output,'expected-mobile.png')});
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
  await page.locator('#say').fill('Describe the diagram'); await page.locator('#send-btn').click();
  await page.waitForFunction(() => !document.querySelector('[data-rtab="expected"]'));
  assert.deepEqual(results.pageErrors, []); assert.deepEqual(results.localFailures, []);
  await page.close();
  const web = await browser.newPage();
  await web.goto(`http://127.0.0.1:${server.address().port}/`); await ready(web);
  await web.locator('#open-examples').click(); await web.locator('[data-sc="house"][data-how="step"]').click();
  await chooseExpected(web);
  assert.equal(await web.locator('#expected-canvas .shp').count(),8);
  results.httpStartup='All four readers and the first check passed; expected house renders eight shapes.';
  await web.close();
  await fs.writeFile(path.join(output,'browser-results.json'), JSON.stringify(results,null,2)+'\n');
  console.log(`PASS: file:// and HTTP startup, ${results.scenarios.length} scenarios, ${results.quick.length} quick examples, main tabs, SOP, plain request text, view controls, isolation, keyboard and phone layout.`);
} catch(error) {
  await fs.writeFile(path.join(output,'browser-failure.json'), JSON.stringify({...results,error:error.stack},null,2)+'\n'); throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
