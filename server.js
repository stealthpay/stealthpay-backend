// server.js – Stripe checkout + webhook með env breytum

require("dotenv").config(); // ef .env notað local

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // úr environment í Gigabyte

const app = express();
const PORT = process.env.PORT || 4242;

// Til að taka á móti JSON í venjulegum routes
app.use(cors());
app.use(express.json());

// Stripe Checkout Endpoint – klárar greiðslu
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
      cancel_url: "https://stealthpay.pro/cancel.html",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe villa:", err);
    res.status(500).json({ error: "Villa við að búa til greiðslu" });
  }
});

// Stripe Webhook – hlustar á greiðslustaðfestingu
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook validation failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Stripe segir okkur að greiðsla kláraðist
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Greiðsla staðfest:", session.id);
    console.log("🚀 Mock: sending DAI til proxy og áfram í Railgun...");
  }

  res.status(200).send("Webhook received");
});

app.listen(PORT, () =>
  console.log(`🚀 StealthPay server keyrir á http://localhost:${PORT}`)
);
