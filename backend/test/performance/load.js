const autocannon = require('autocannon');
const { promisify } = require('util');
const wait = promisify(setTimeout);

const BASE = process.env.PERF_BASE || 'http://localhost:8888';
const ADMIN_EMAIL = process.env.PERF_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@admin.com';
const ADMIN_PASS = process.env.PERF_ADMIN_PASS || process.env.ADMIN_PASSWORD || 'admin123';

async function login() {
  console.log(`[PERF] logging in as: ${ADMIN_EMAIL}`);
  const res = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  console.log(`[PERF] login status: ${res.status}`);
  const j = await res.json();
  if (!j.success || !j.result || !j.result.token) throw new Error('Login failed: ' + JSON.stringify(j));
  console.log('[PERF] login successful');
  return j.result.token;
}

async function createClient(token, name = 'perf-client') {
  const res = await fetch(`${BASE}/api/client/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
  const j = await res.json();
  if (!j.success) throw new Error('Create client failed: ' + JSON.stringify(j));
  console.log(`[PERF] client created: ${j.result._id}`);
  return j.result._id;
}

async function createInvoice(token, clientId) {
  const payload = {
    client: clientId,
    number: Math.floor(Math.random() * 1000000),
    year: new Date().getFullYear(),
    status: 'draft',
    expiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    date: new Date(),
    items: [{ itemName: 'Perf Item', quantity: 1, price: 100, total: 100 }],
    taxRate: 0,
  };

  const res = await fetch(`${BASE}/api/invoice/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  if (!j.success) throw new Error('Create invoice failed: ' + JSON.stringify(j));
  console.log(`[PERF] invoice created: ${j.result._id}`);
  return j.result._id;
}

async function runAutocannon(token, clientId, invoiceId, opts = {}) {
  const { connections = 50, duration = 30 } = opts;

  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: BASE,
        connections,
        duration,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        requests: [
          {
            method: 'POST',
            path: '/api/payment/create',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client: clientId,
              invoice: invoiceId,
              number: 1,
              date: new Date(),
              amount: 1,
              currency: 'USD',
            }),
          },
          {
            method: 'POST',
            path: '/api/invoice/create',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client: clientId,
              number: Math.floor(Math.random() * 1000000),
              year: new Date().getFullYear(),
              status: 'draft',
              expiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              date: new Date(),
              items: [{ itemName: 'Load Item', quantity: 1, price: 10, total: 10 }],
              taxRate: 0,
            }),
          },
        ],
      },
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

function printResults(result) {
  console.log('\n' + '='.repeat(60));
  console.log('PERF - LOAD TEST RESULTS');
  console.log('='.repeat(60));
  if (result.requests) console.log(`Total requests: ${result.requests.total}  |  Req/sec: ${result.requests.mean.toFixed(2)}`);
  if (result.latency) console.log(`Latency p50: ${result.latency.p50}ms  p99: ${result.latency.p99}ms`);
  if (result.errors) console.log(`Errors: ${result.errors}`);
  console.log('='.repeat(60) + '\n');
}

(async () => {
  try {
    console.log('\n[PERF] Starting load test (50 connections, 30s)');
    console.log(`[PERF] Base: ${BASE}`);

    const token = await login();
    const clientId = await createClient(token, 'perf-client-load');
    const invoiceId = await createInvoice(token, clientId);

    await wait(1500);
    const result = await runAutocannon(token, clientId, invoiceId, { connections: 50, duration: 30 });
    printResults(result);

    if (result.errors > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('[PERF] load error:', err.message || err);
    process.exit(1);
  }
})();
