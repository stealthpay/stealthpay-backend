// server.js – Stripe backend + mock DAI sending (test)

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")("sk_test_REPLACE_WITH_YOUR_SECRET_KEY"); // TODO: Settu þinn Stripe secret key

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// Stripe Checkout Endpoint
app.post("/create-checkout-session", async (req, res) => {
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "isk",
            product_data: {
              name: "Greiðsla í StealthPay",
            },
            unit_amount: parseInt(amount) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://stealthpay.pro/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://stealthpay.pro/cancel.html"
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe villa:", err);
    res.status(500).json({ error: "Villa við að búa til greiðslu" });
  }
});

// Stripe Webhook (mock DAI sending)
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event = req.body;

  try {
    event = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send(`Webhook parse failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Greiðsla staðfest. Session:", session.id);
    // TODO: Mock send DAI → Proxy → Railgun hér
    console.log("🚀 [Mock] Sending 100 DAI to proxy veski...");
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => console.log(`🚀 Stripe server keyrir á http://localhost:${PORT}`));
