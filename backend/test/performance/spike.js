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

async function runSpike(token, clientId, invoiceId) {
  // run small bursts back-to-back to simulate spike
  for (let i = 0; i < 5; i++) {
    console.log(`Spike round ${i + 1}/5 - 300 connections, 10s`);
    await new Promise((resolve, reject) => {
      const instance = autocannon(
        {
          url: BASE,
          connections: 300,
          duration: 10,
          headers: { Authorization: `Bearer ${token}` },
          requests: [
            {
              method: 'POST',
              path: '/api/payment/create',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ client: clientId, invoice: invoiceId, number: i + 1, date: new Date(), amount: 1, currency: 'USD' }),
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

    // short pause between spikes
    await wait(1500);
  }
}

function printResults(result) {
  console.log('\n' + '='.repeat(60));
  console.log('PERF - SPIKE ROUND RESULTS');
  console.log('='.repeat(60));
  if (result.requests) console.log(`Total requests: ${result.requests.total}  |  Req/sec: ${result.requests.mean.toFixed(2)}`);
  if (result.latency) console.log(`Latency p50: ${result.latency.p50}ms  p99: ${result.latency.p99}ms`);
  if (result.errors) console.log(`Errors: ${result.errors}`);
  console.log('='.repeat(60));
}

(async () => {
  try {
    console.log('\n[PERF] Starting spike test (5 bursts, 300 connections each)');
    console.log(`[PERF] Base: ${BASE}`);

    const token = await login();
    const clientId = await createClient(token, 'perf-client-spike');
    const invoiceId = await createInvoice(token, clientId);

    await wait(1500);
    for (let i = 0; i < 5; i++) {
      console.log(`[PERF] spike round ${i + 1}/5`);
      // run single burst and print result
      const res = await new Promise((resolve, reject) => {
        const instance = autocannon({
          url: BASE,
          connections: 300,
          duration: 10,
          headers: { Authorization: `Bearer ${token}` },
          requests: [
            {
              method: 'POST',
              path: '/api/payment/create',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ client: clientId, invoice: invoiceId, number: i + 1, date: new Date(), amount: 1, currency: 'USD' }),
            },
          ],
        }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        autocannon.track(instance, { renderProgressBar: true });
      });
      printResults(res);
      await wait(1500);
    }

    process.exit(0);
  } catch (err) {
    console.error('[PERF] spike error:', err.message || err);
    process.exit(1);
  }
})();
