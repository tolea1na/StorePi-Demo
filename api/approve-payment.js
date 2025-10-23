// api/approve-payment.js
// Vercel serverless function (node14+ style)
// POST { paymentId } -> try to approve via Pi server API if PI_SERVER_API_KEY present,
// otherwise return demo-mode OK.
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ ok:true, message:'approve-payment endpoint is live' });
  }
  if (req.method !== 'POST') return res.status(405).json({ ok:false, message:'method not allowed' });

  const body = req.body || {};
  const paymentId = body.paymentId;
  if(!paymentId) return res.status(400).json({ ok:false, message:'missing paymentId' });

  const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
  const PI_API_BASE = process.env.PI_API_BASE || 'https://api.testnet.minepi.com';

  // Demo mode if no server API key configured
  if(!PI_SERVER_API_KEY){
    // Simulate server approval in demo-mode
    return res.json({ ok:true, message:'demo-mode server approve (no API key configured)', paymentId });
  }

  try {
    // Example Pi server call - adapt to actual Pi API path if different.
    // NOTE: confirm exact Pi API endpoint/params from Pi docs. I use a common pattern:
    const endpoint = `${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/approve`;
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PI_SERVER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ developer_action: 'approve' })
    });
    const j = await r.json().catch(()=>({ raw: 'not-json' }));
    if(!r.ok) return res.status(502).json({ ok:false, message:'pi server error', status:r.status, body:j });
    return res.json({ ok:true, message:'server approved', paymentId, piResponse:j });
  } catch(err){
    return res.status(500).json({ ok:false, message:'server error', error:String(err) });
  }
}
