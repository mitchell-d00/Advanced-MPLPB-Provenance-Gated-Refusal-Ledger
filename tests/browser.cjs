'use strict';
// Exercise the shipped console in Chromium, with its real bundled engines.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {createHash} = require('node:crypto');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.env.ADVANCED_BROWSER_OUTPUT || path.join(root, '..', 'advanced-browser-results'));
fs.mkdirSync(output, {recursive:true});
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.txt':'text/plain'};
let server, browser;
const results = [];
async function ready(page) {
  await page.waitForFunction(() => window.AdvancedMPLPB);
  const result = await page.evaluate(() => Promise.race([
    AdvancedMPLPB.ready(), new Promise((_, reject) => setTimeout(() => reject(Error('Engine startup timeout')), 120000))
  ]));
  assert.equal(result.ok, true);
}
function checkChain(records) {
  let previous = 'GENESIS';
  for (const {hash, ...body} of records) {
    assert.equal(body.previous, previous);
    assert.equal(hash, createHash('sha256').update(JSON.stringify(body)).digest('hex'));
    previous = hash;
  }
}
(async () => {
  try {
    let base = process.env.ADVANCED_BASE_URL;
    if (!base) {
      server = http.createServer((req, res) => {
        const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        const file = path.resolve(root, 'web', '.' + (name.endsWith('/') ? name + 'index.html' : name));
        if (!file.startsWith(path.join(root, 'web') + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          res.writeHead(404); res.end(); return;
        }
        res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      base = `http://127.0.0.1:${server.address().port}/`;
    }
    browser = await chromium.launch({headless:true});
    const context = await browser.newContext({viewport:{width:1366,height:900}, acceptDownloads:true});
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    const errors = [], external = [], failed = [];
    const origin = new URL(base).origin;
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== origin) external.push(r.url()); });
    page.on('requestfailed', r => failed.push(r.url()));
    await page.goto(base + '#console');
    await ready(page);
    assert.equal(await page.locator('#mpl-status').textContent(), 'Connected');
    assert.equal(await page.locator('#calc-status').textContent(), 'Verified');
    results.push('Real bundled WebAssembly worker and calculator startup');

    const hasHub = await page.evaluate(() => !!window.AdvancedMPLPBHub);
    if (process.env.ADVANCED_REQUIRE_HUB === '1') assert.equal(hasHub, true, 'Candidate must expose the hub API');
    if (hasHub) {
      await page.locator('nav [data-view="hub"]').click();
      assert.equal(await page.locator('#hub-cards .hub-card').count(), 3);
      await page.locator('#hub-project').selectOption('calculator');
      await page.locator('#hub-call').click();
      await page.waitForFunction(() => document.getElementById('hub-output').textContent.includes('"value": 9'));
      const checks = await page.evaluate(() => AdvancedMPLPBHub.checkAll());
      assert.equal(checks.length, 3); assert(checks.every(r => r.pass));
      const boundary = await page.evaluate(async () => {
        const errors = [];
        for (const fn of [() => AdvancedMPLPBHub.call('calculator','eval',['alert(1)']), () => AdvancedMPLPBHub.call('calculator','calculate',{}), () => AdvancedMPLPBHub.call('mplpb','retrieve',['kit',{allowNetwork:true}]), () => AdvancedMPLPBHub.checkDeployment('calculator','javascript:alert(1)')]) {
          try { await fn(); } catch(e) { errors.push(e.message); }
        }
        return errors;
      });
      assert.equal(boundary.length, 4);
      const deployment = await page.evaluate(base => AdvancedMPLPBHub.checkDeployment('pendulums',base+'vendor/'), base);
      assert.equal(deployment.pass, true); assert.equal(deployment.matchesBundled, true);
      await page.locator('#hub-stage-docs').selectOption('pass');
      await page.locator('[data-save-stage="docs"]').click();
      assert.match(await page.locator('#hub-storage-status').textContent(), /Add evidence/);
      await page.locator('#hub-evidence-docs').fill('Chromium test fixture: documentation guide inspected');
      await page.locator('[data-save-stage="docs"]').click();
      assert.equal((await page.evaluate(() => AdvancedMPLPBHub.getChecklist())).calculator.docs.status, 'pass');
      const hubDownloadPromise = page.waitForEvent('download');
      await page.locator('#hub-export').click();
      const hubDownload = await hubDownloadPromise;
      await hubDownload.saveAs(path.join(output,'hub-report.json'));
      const report = JSON.parse(fs.readFileSync(path.join(output,'hub-report.json')));
      assert.equal(report.checklist.calculator.docs.authority, 'user-reported');
      assert.equal(report.checks.length, 4);
      for (const width of [390,1366]) {
        await page.setViewportSize({width,height:900});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Hub overflow at ${width}`);
        await page.screenshot({path:path.join(output, `hub-${width}.png`),fullPage:true});
      }
      results.push('Hub: three adapters, JSON playground, method/input boundaries, deployment hash, evidence-required checklist and report download');
    }
    await page.locator('nav [data-view="console"]').click();

    await page.locator('#corpus').selectOption('studio');
    await page.locator('#claim').fill('what does it mean if the guard has gone over');
    await page.locator('#submit-claim').click();
    await page.waitForFunction(() => document.getElementById('decision-status').textContent === 'retrieved');
    assert.equal(await page.locator('#decision-notice').isVisible(), true);
    let snapshot = await page.evaluate(() => AdvancedMPLPB.exportSession());
    assert.equal(snapshot.records.at(-1).answer_supported, false);
    assert.equal(snapshot.records.at(-1).response.data.source.id, 'STUDIO-0006');
    results.push('UI retrieval retains exact owner and answer_supported:false');

    await page.locator('[data-mode="source"]').click();
    await page.locator('#corpus').selectOption('logic');
    await page.locator('#claim').fill('What is Dungeons and Dragons?');
    await page.locator('#submit-claim').click();
    await page.waitForFunction(() => document.getElementById('decision-status').textContent === 'return');
    await page.locator('[data-mode="calculate"]').click();
    await page.locator('#claim').fill('sin(pi/2)+2^3');
    await page.locator('#submit-claim').click();
    await page.waitForFunction(() => document.getElementById('decision-text').textContent === '9');
    await page.locator('[data-mode="dynamics"]').click();
    await page.locator('#submit-claim').click();
    await page.waitForFunction(() => document.getElementById('decision-status').textContent === 'pass');
    await page.locator('[data-mode="composed"]').click();
    await page.locator('#claim').fill('What is Dungeons and Dragons?');
    const before = (await page.evaluate(() => AdvancedMPLPB.exportSession())).records.length;
    await page.locator('#submit-claim').click();
    await page.waitForFunction(n => AdvancedMPLPB.exportSession().records.length === n + 2, before);
    snapshot = await page.evaluate(() => AdvancedMPLPB.exportSession());
    assert.equal(snapshot.records.at(-1).status, 'pass');
    assert.equal(snapshot.records.at(-1).response.initialAgreement, true);
    const denied = await page.evaluate(() => AdvancedMPLPB.compose('Prove retrocausal communication.', {corpus:'logic',profile:'internal'}));
    assert.equal(denied.status, 'refused');
    assert.equal(denied.response.numeric, undefined);
    assert.equal(denied.response.dynamics, undefined);
    results.push('All five console modes; unsupported composition stops before numeric work');

    await page.locator('nav [data-view="sources"]').click();
    await page.locator('#pages-list [data-page]').first().click();
    await page.waitForFunction(() => document.getElementById('page-evidence').textContent.includes('"ok": true'));
    await page.locator('#run-suite').click();
    await page.waitForFunction(() => document.querySelector('#test-summary strong').textContent === '66 / 66 checks passed');
    results.push('Declared page inspection and all 66 built-in kill tests, including frozen 56 owners/outcomes');
    await page.locator('nav [data-view="ledger"]').click();
    await page.locator('#ledger-filter').selectOption('retrieved');
    const retrievedCount = await page.evaluate(() => AdvancedMPLPB.exportSession().records.filter(r => r.status === 'retrieved').length);
    assert.equal(await page.locator('#ledger-table [data-receipt]').count(), retrievedCount);
    await page.locator('#ledger-table [data-receipt]').first().click();
    assert.equal(await page.locator('#receipt-dialog').isVisible(), true);
    await page.locator('#close-receipt').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export-ledger').click();
    const download = await downloadPromise;
    const exportedFile = path.join(output, 'session.json');
    await download.saveAs(exportedFile);
    const exported = JSON.parse(fs.readFileSync(exportedFile));
    snapshot = await page.evaluate(() => AdvancedMPLPB.exportSession());
    assert.equal(exported.chainIntact, true);
    assert.deepEqual(exported.records, snapshot.records);
    checkChain(exported.records);
    assert.equal(await page.evaluate(async () => (await indexedDB.databases()).length > 0), true);
    await page.reload(); await ready(page);
    const restored = await page.evaluate(() => AdvancedMPLPB.exportSession());
    assert.deepEqual(restored.records, snapshot.records);
    assert.equal(restored.chainValid, true);
    if (hasHub) assert.equal((await page.evaluate(() => AdvancedMPLPBHub.getChecklist())).calculator.docs.status, 'pass');
    results.push('Receipt dialog, status filter, JSON download, hash chain and local ledger reload; IndexedDB initialized');

    for (const width of [390,1366]) {
      await page.setViewportSize({width,height:900});
      await page.locator('nav [data-view="console"]').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `Console overflow at ${width}`);
      await page.screenshot({path:path.join(output, `console-${width}.png`), fullPage:true});
    }
    // With startup complete, calls continue with HTTP requests blocked.
    await context.setOffline(true);
    const offline = await page.evaluate(() => AdvancedMPLPB.retrieve('what does it mean if the guard has gone over', {corpus:'studio',profile:'internal'}));
    assert.equal(offline.status, 'retrieved');
    await context.setOffline(false);
    results.push('390/1366 console layout and warmed-tab offline retrieval (no offline reload claim)');

    // Deliberate corruption in this isolated test profile must stop writes.
    await page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('advanced-mplpb-ledger-v1'));
      rows[0].claim = 'tampered';
      localStorage.setItem('advanced-mplpb-ledger-v1', JSON.stringify(rows));
    });
    await page.reload(); await ready(page);
    assert.equal((await page.evaluate(() => AdvancedMPLPB.exportSession())).chainValid, false);
    assert.match(await page.locator('#chain-status').textContent(), /INTEGRITY FAILURE/);
    const rejected = await page.evaluate(async () => {
      try { await AdvancedMPLPB.calculate('1+1'); return ''; } catch (e) { return e.message; }
    });
    assert.match(rejected, /integrity failed/);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.deepEqual(failed, []);
    results.push('Tampered ledger stops recording; no page errors or cross-origin HTTP requests');
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({base,passed:true,results,records:exported.records.length,independence_verified:false},null,2)+'\n');
    console.log(JSON.stringify({passed:true,results,records:exported.records.length},null,2));
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
