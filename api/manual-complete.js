// api/manual-complete.js
export default async function handler(req, res) {
  const { paymentId, txid } = req.query;
  if (!paymentId || !txid) return res.status(400).json({ ok:false, error:'missing paymentId or txid' });

  const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
  const PI_API_BASE = process.env.PI_API_BASE || 'https://api.testnet.minepi.com';

  if (!PI_SERVER_API_KEY) return res.json({ ok:true, message:'demo manual complete (no key)', paymentId, txid });

  try {
    const endpoint = `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/complete`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${PI_SERVER_API_KEY}` },
      body: JSON.stringify({ txid })
    });
    const j = await r.json().catch(()=>({ raw:'not-json' }));
    if (!r.ok) return res.status(502).json({ ok:false, error:'pi server error', status:r.status, body:j });
    return res.json({ ok:true, status:r.status, paymentId, txid, piResponse:j });
  } catch (err) {
    return res.status(500).json({ ok:false, error:String(err) });
  }
}
