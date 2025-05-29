const express = require("express");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = './wallets.json';
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

function loadWallets() {
  return JSON.parse(fs.readFileSync(FILE));
}
function saveWallets(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ✉️ Stillingar fyrir netpóst
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: "billing@stealthpay.pro",
    pass: "SETTU_LYKILORÐ_HÉR" // skiptu út fyrir alvöru lykilorð
  }
});

app.get("/", (req, res) => {
  res.send("✅ StealthPay backend virkar!");
});

// 🟢 Skráning
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vantar upplýsingar" });
  }

  const wallets = loadWallets();

  // Athuga hvort netfang sé þegar til
  const exists = Object.values(wallets).find(w => w.email === email);
  if (exists) return res.status(400).json({ error: "Netfang þegar skráð" });

  const walletId = "burneWallet_" + Math.random().toString(36).substr(2, 6).toUpperCase();
  wallets[walletId] = { name, email, password, balance: 0 };
  saveWallets(wallets);

  // ✉️ Senda email
  transporter.sendMail({
    from: '"StealthPay" <billing@stealthpay.pro>',
    to: email,
    subject: "Velkomin(n) í StealthPay",
    text: `Sæll/Sæl ${name},\n\nTakk fyrir að skrá þig í StealthPay!\n\nVeski: ${walletId}\n\nKveðja,\nStealthPay teymið`
  }).then(() => {
    console.log("📨 Email sent to:", email);
  }).catch((err) => {
    console.error("❌ Gat ekki sent email:", err.message);
  });

  res.json({ walletId, name, email });
});

app.listen(3000, () => {
  console.log("🚀 StealthPay keyrir á http://localhost:3000");
});
