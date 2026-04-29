#!/usr/bin/env node
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const cdp = process.env.CDP_URL || 'http://127.0.0.1:9222';
const out = resolve(process.argv[2] || 'schedule.xlsx');
const qgendaRe = /https:\/\/app\.qgenda\.com\/Schedule\//;

async function json(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${url}`);
  return r.json();
}

async function send(ws, method, params = {}) {
  const id = send.nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return await new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id !== id) return;
      ws.removeEventListener('message', onMessage);
      if (msg.error) reject(new Error(`${method}: ${JSON.stringify(msg.error)}`));
      else resolve(msg.result);
    };
    ws.addEventListener('message', onMessage);
    setTimeout(() => reject(new Error(`${method} timed out`)), 120000).unref?.();
  });
}
send.nextId = 1;

const targets = await json(`${cdp}/json`);
const target = targets.find(t => t.type === 'page' && qgendaRe.test(t.url));
if (!target) {
  throw new Error(`No QGenda schedule tab found at ${cdp}. Open/log into QGenda in the CDP-enabled browser first.`);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});

const expr = `
(async () => {
  const blob = window.__lastReportBlob;
  if (!blob) return { ok: false, error: 'window.__lastReportBlob is missing. Run the Grid By Staff Excel report first, or inject the report-capture hook before clicking Run Report.' };
  const buf = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { ok: true, type: blob.type, size: blob.size, base64: btoa(binary) };
})()
`;
const result = await send(ws, 'Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
ws.close();
const value = result?.result?.value;
if (!value?.ok) throw new Error(value?.error || 'QGenda report blob evaluation failed');
await mkdir(dirname(out), { recursive: true });
await writeFile(out, Buffer.from(value.base64, 'base64'));
console.log(JSON.stringify({ output: out, bytes: value.size, type: value.type }, null, 2));
