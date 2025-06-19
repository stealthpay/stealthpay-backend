require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

// Test endpoint til að sjá hvort þjónustan keyri
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(PORT, () => {
  console.log(`🚀 StealthPay Stripe server keyrir á http://localhost:${PORT}`);
});
