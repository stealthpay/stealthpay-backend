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

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vantar upplýsingar" });
  }

  const wallets = loadWallets();
  const exists = Object.values(wallets).find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "Netfang þegar skráð" });
  }

  const walletId = "burneWallet_" + Math.random().toString(36).substr(2, 6).toUpperCase();
  wallets[walletId] = { name, email, password, balance: 0 };
  saveWallets(wallets);

  try {
    await transporter.sendMail({
      from: '"StealthPay" <billing@stealthpay.pro>',
      to: email,
      subject: "Velkomin(n) í StealthPay!",
      text: `Sæll ${name},\n\nÞú hefur verið skráð/ur inn.\nVeskið þitt er: ${walletId}`
    });
  } catch (err) {
    console.error("Email villa:", err.message);
  }

  res.json({ name, email, walletId });
});

app.listen(3000, () => {
  console.log("✅ StealthPay server keyrir á http://localhost:3000");
});
