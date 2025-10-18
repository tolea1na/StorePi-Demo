// api/manual-approve.js
// Vercel serverless endpoint to manually approve a Pi payment.
// Usage (browser): https://<your-vercel-domain>/api/manual-approve?paymentId=PAYMENT_ID
// Requires PI_SERVER_API_KEY set in Vercel Environment Variables.

export default async function handler(req, res) {
  // Allow GET for convenience (browser) and POST for other clients
  const method = req.method || 'GET';
  const paymentId = (method === 'GET' ? req.query.paymentId : (req.body && req.body.paymentId));
  if (!paymentId) {
    return res.status(400).json({ ok: false, error: 'Missing paymentId (use ?paymentId=...)' });
  }

  const API_KEY = process.env.PI_SERVER_API_KEY || process.env.PI_API_KEY || process.env.PI_SERVER_KEY;
  if (!API_KEY) {
    return res.status(500).json({ ok: false, error: 'Server API key not configured in environment variables (PI_SERVER_API_KEY)' });
  }

  try {
    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`;
    // Use fetch which is available in Vercel Node runtimes
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const text = await r.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(text); } catch(e) { parsed = { raw: text }; }

    return res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      pi_response: parsed
    });
  } catch (e) {
    console.error('approve error', e);
    return res.status(500).json({ ok:false, error: String(e) });
  }
}
