// server.js — Stripe test greiðslu backend

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("✅ StealthPay Stripe server keyrir!");
});

// Stripe endpoint
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
              name: "Greiðsla í StealthPay"
            },
            unit_amount: parseInt(amount) * 100
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: "https://stealthpay.pro/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://stealthpay.pro/cancel.html"
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe villa:", err.message);
    res.status(500).json({ error: "Villa við að búa til greiðslu" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Stripe server keyrir á http://localhost:${PORT}`);
});
