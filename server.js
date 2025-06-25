// server.js – einfalt proxy kerfi fyrir StealthPay
const express = require("express");
const app = express();
const cors = require("cors");
const { ethers } = require("ethers");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4242;

// Settu inn eigin gögn hér
const INFURA_URL = "https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY";
const PRIVATE_KEY = "YOUR_PRIVATE_KEY"; // veski A eða proxy veski

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// 👉 API route til að framkvæma færslu
app.post("/send", async (req, res) => {
  const { to, amount } = req.body;
  if (!to || !amount) return res.status(400).send("Villa: vantar 'to' og 'amount'");

  try {
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseUnits(amount.toString(), "ether")
    });

    console.log("🚀 Færslan send:", tx.hash);
    res.send({ hash: tx.hash });
  } catch (err) {
    console.error("⚠️ Villa við sendingu:", err);
    res.status(500).send("Færsla mistókst");
  }
});

app.listen(PORT, () => {
  console.log(`✅ server.js keyrir á http://localhost:${PORT}`);
});
