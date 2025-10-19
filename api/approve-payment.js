// api/approve-payment.js
// Approve + complete in one server call. Expects POST { paymentId }.
// Uses PI_API_KEY environment variable.

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(200).json({ ok:true, message:'Send POST with paymentId' });

    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({ ok:false, error:'paymentId required' });

    const API_KEY = process.env.PI_API_KEY;
    if (!API_KEY) return res.status(500).json({ ok:false, error:'Missing PI_API_KEY' });

    const headers = { 'Authorization': `Key ${API_KEY}`, 'Content-Type': 'application/json' };

    // 1) Approve payment
    const approveRes = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`, {
      method: 'POST', headers, body: JSON.stringify({}) 
    });
    const approveText = await approveRes.text();
    let approveJson; try { approveJson = JSON.parse(approveText); } catch(e) { approveJson = { raw: approveText }; }

    if (!approveRes.ok) {
      return res.status(500).json({ ok:false, step:'approve', status: approveRes.status, body: approveJson });
    }

    // 2) If approval returned txid (or wait to get txid from client), try to complete immediately.
    // If Pi requires txid, client should send txid; here we'll attempt complete with no txid and handle gracefully.
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`, {
      method: 'POST', headers, body: JSON.stringify({})
    });
    const completeText = await completeRes.text();
    let completeJson; try { completeJson = JSON.parse(completeText); } catch(e) { completeJson = { raw: completeText }; }

    // Return both responses to help debugging
    return res.status(200).json({
      ok: true,
      approved: { status: approveRes.status, body: approveJson },
      completed: { status: completeRes.status, body: completeJson }
    });
  } catch (err) {
    console.error('approve-payment error', err);
    return res.status(500).json({ ok:false, error:String(err) });
  }
}
