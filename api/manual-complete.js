// api/manual-complete.js
// Usage (browser): /api/manual-complete?paymentId=PAYMENT_ID&txid=TXID
export default async function handler(req, res) {
  try {
    const paymentId = req.query.paymentId;
    const txid = req.query.txid;
    const API_KEY = process.env.PI_API_KEY;

    if (!paymentId) return res.status(400).json({ ok:false, error: "Missing paymentId" });
    if (!txid) return res.status(400).json({ ok:false, error: "Missing txid" });
    if (!API_KEY) return res.status(500).json({ ok:false, error: "Missing PI_API_KEY in environment" });

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const text = await r.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(text); } catch(e) { parsed = { raw: text }; }

    return res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      paymentId,
      txid,
      piResponse: parsed
    });
  } catch (err) {
    console.error('manual-complete error', err);
    return res.status(500).json({ ok:false, error: String(err) });
  }
}
