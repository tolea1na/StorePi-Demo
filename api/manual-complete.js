// api/manual-complete.js
// This endpoint finalizes a Pi payment by marking it "completed" via the Pi Network API.

export default async function handler(req, res) {
  try {
    const { paymentId } = req.query;
    const API_KEY = process.env.PI_API_KEY;

    if (!paymentId) {
      return res.status(400).json({ ok: false, error: "Missing paymentId" });
    }
    if (!API_KEY) {
      return res.status(500).json({ ok: false, error: "Missing PI_API_KEY in environment" });
    }

    // Call Pi Network "complete payment" endpoint
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    res.status(response.status).json({
      ok: true,
      message: "Payment marked as completed",
      paymentId,
      piResponse: data,
    });
  } catch (error) {
    console.error("Manual complete error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
