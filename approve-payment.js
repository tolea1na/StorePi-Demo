/**
 * api/approve-payment.js
 * Simple Vercel serverless handler supporting GET (ping) and POST (approve)
 * Expects environment variable PI_SERVER_API_KEY to be set in Vercel.
 */
module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, message: 'approve-payment endpoint is live' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId required' });
    }

    const APIKEY = process.env.PI_SERVER_API_KEY;
    if (!APIKEY) {
      return res.status(500).json({ error: 'Server API key not configured' });
    }

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`;
    const fetch = require('node-fetch');
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Key ${APIKEY}`, 'Content-Type': 'application/json' },
    });

    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }

    if (!r.ok) return res.status(r.status).json({ ok:false, body: json });

    return res.status(200).json({ ok:true, payment: json });
  } catch (err) {
    console.error('approve-payment error', err);
    return res.status(500).json({ error: String(err) });
  }
};
