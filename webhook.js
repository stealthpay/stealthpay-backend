// webhook.js – Stripe webhook sem staðfestir greiðslu

const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_REPLACE_WITH_YOUR_SECRET_KEY");
const bodyParser = require("body-parser");

const endpointSecret = "whsec_REPLACE_WITH_WEBHOOK_SECRET"; // Stripe webhook signing secret

// Stripe mælir með að nota raw body fyrir webhook
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook validation failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Greiðslan hefur verið staðfest
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("✅ Greiðsla staðfest fyrir session:", session.id);

    // TODO: Kveikja á proxy + Railgun DAI afhendingu hér
    console.log("🚀 Sending DAI til proxy + í gegnum Railgun...");
  }

  res.status(200).send("Webhook móttekið");
});

// Ef þú keyrir standalone
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`🔔 Webhook keyrir á http://localhost:${PORT}/webhook`));
