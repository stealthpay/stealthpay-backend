// server.js – Stripe greiðslur + webhook + mock DAI sending

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // ✅ Dregið úr GitHub secret

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// ✅ Endpoint til að búa til Stripe Checkout session
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
            unit_amount: parseInt(amount) * 100, // ISK í aurum
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
    console.error("⚠️ Stripe villa:", err);
    res.status(500).json({ error: "Villa við að búa til greiðslu" });
  }
});

// ✅ Webhook endpoint frá Stripe (mock sending DAI)
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event;

  try {
    event = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send(`⚠️ Villa við webhook parse: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Greiðsla staðfest:", session.id);
    console.log("🚀 [Mock] Sendi 100 DAI í proxy veski... og áfram í Railgun.");
    // TODO: Setja inn alvöru DAI sendingu hér síðar
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`🚀 Stripe server keyrir á http://localhost:${PORT}`);
});
