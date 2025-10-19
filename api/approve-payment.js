// api/approve-payment.js
// POST { paymentId, txid? }
// Optional header: X-ADMIN-TOKEN for extra security (configure ADMIN_TOKEN in Vercel env)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(200).json({ ok:true, message:'POST paymentId required' });

    const { paymentId, txid } = req.body || {};
    if (!paymentId) return res.status(400).json({ ok:false, error:'paymentId required' });

    // optional admin token check
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
    const clientToken = req.headers['x-admin-token'] || '';
    if (ADMIN_TOKEN && clientToken !== ADMIN_TOKEN) {
      return res.status(403).json({ ok:false, error:'Forbidden - invalid admin token' });
    }

    const API_KEY = process.env.PI_API_KEY || process.env.PI_SERVER_API_KEY;
    if (!API_KEY) return res.status(500).json({ ok:false, error:'Missing PI_API_KEY in environment' });

    const headers = { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' };

    // 1) Approve
    const approveUrl = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`;
    const approveRes = await fetch(approveUrl, { method:'POST', headers, body: JSON.stringify({}) });
    const approveText = await approveRes.text().catch(()=>'');
    let approveBody; try { approveBody = JSON.parse(approveText); } catch(e) { approveBody = { raw: approveText }; }

    if (!approveRes.ok) {
      return res.status(Math.max(400, approveRes.status)).json({ ok:false, step:'approve', status:approveRes.status, body:approveBody });
    }

    // 2) If txid provided, call complete immediately (safe)
    let completeBody = null;
    if (txid) {
      const completeUrl = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;
      const completeRes = await fetch(completeUrl, { method:'POST', headers, body: JSON.stringify({ txid }) });
      const completeText = await completeRes.text().catch(()=>'');
      try { completeBody = JSON.parse(completeText); } catch(e) { completeBody = { raw: completeText }; }
      if (!completeRes.ok) {
        // return both results for debugging
        return res.status(Math.max(400, completeRes.status)).json({ ok:false, step:'complete', status: completeRes.status, body: completeBody, approved: approveBody });
      }
    }

    // success
    return res.status(200).json({
      ok: true,
      message: 'Approved' + (txid ? ' and completed' : ' (pending completion)'),
      paymentId,
      txid: txid || null,
      approve: approveBody,
      complete: completeBody
    });

  } catch (err) {
    console.error('approve-payment error', err);
    return res.status(500).json({ ok:false, error: String(err) });
  }
}
