const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // ✅ leynilykill úr Render

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// ✅ Stripe checkout endpoint
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
              name: "StealthPay greiðsla",
            },
            unit_amount: parseInt(amount) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://stealthpay.pro/success.html",
      cancel_url: "https://stealthpay.pro/cancel.html",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Villa við Stripe:", err);
    res.status(500).json({ error: "Villa við greiðslu" });
  }
});

// ✅ Stripe webhook (mock sending)
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event = req.body;

  try {
    event = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).send(`Parsing error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Greiðsla móttekin:", session.id);
    console.log("🚀 [Mock] Sending DAI...");
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => console.log(`🚀 Server keyrir á http://localhost:${PORT}`));
