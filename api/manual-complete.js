// api/manual-complete.js
export default async function handler(req, res) {
  const paymentId = req.query.paymentId;
  const txid = req.query.txid;
  const API_KEY = process.env.PI_API_KEY || process.env.PI_SERVER_API_KEY;
  if (!paymentId) return res.status(400).json({ ok:false, error:'paymentId required' });
  if (!API_KEY) return res.status(500).json({ ok:false, error:'Missing PI_API_KEY' });
  try {
    const headers = { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' };
    // approve
    await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`, { method:'POST', headers, body: JSON.stringify({}) });
    // complete if txid provided
    let c = null;
    if (txid) {
      const cr = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`, { method:'POST', headers, body: JSON.stringify({ txid }) });
      c = await cr.text();
    }
    return res.status(200).json({ ok:true, paymentId, txid, complete: c });
  } catch(e) {
    return res.status(500).json({ ok:false, error: String(e) });
  }
}
