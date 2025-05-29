const express = require("express");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json());

const FILE = "./wallets.json";
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");

function loadWallets() {
  return JSON.parse(fs.readFileSync(FILE));
}

function saveWallets(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Netpóststillingar
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "billing@stealthpay.pro",
    pass: "aCJU0wYctkCkz4k"
  }
});

// Forsíða
app.get("/", (req, res) => {
  res.send("✅ StealthPay backend virkar!");
});

// Skráning
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vantar nafn, email eða lykilorð" });
  }

  const wallets = loadWallets();

  // Check if already registered
  const already = Object.values(wallets).find(x => x.email === email);
  if (already) {
    return res.status(400).json({ error: "Netfang þegar skráð" });
  }

  const walletId = "burneWallet_" + Math.random().toString(36).substr(2, 6).toUpperCase();
  wallets[walletId] = { name, email, password, walletId, balance: 0 };
  saveWallets(wallets);

  // Send email
  try {
    await transporter.sendMail({
      from: '"StealthPay" <billing@stealthpay.pro>',
      to: email,
      subject: "Skráning tókst!",
      text: `Sæll ${name},\n\nVelkomin(n) í StealthPay!\nVeski: ${walletId}`
    });
  } catch (err) {
    console.error("❌ Tölvupóstvilla:", err.message);
  }

  res.json({ name, walletId });
});

app.listen(3000, () => {
  console.log("🚀 StealthPay backend keyrir á http://localhost:3000");
});
