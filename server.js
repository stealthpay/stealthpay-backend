// server.js eða api/create-checkout-session.js

const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_51Hxxx...replace_with_your_key");
const cors = require("cors");

app.use(cors());
app.use(express.json());

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
              name: "Innborgun í StealthPay",
            },
            unit_amount: parseInt(amount) * 100, // ISK með 2 aukastöfum
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://stealthpay.pro/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://stealthpay.pro/cancel.html",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe villa:", error);
    res.status(500).json({ error: "Villa við að búa til greiðslusession" });
  }
});

// Keyra local eða í Render:
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`🚀 Stripe server keyrir á http://localhost:${PORT}`));
