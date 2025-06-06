const express = require("express");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Skráarheiti fyrir vistaðar veski
const FILE = "./wallets.json";
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");

function loadWallets() {
  return JSON.parse(fs.readFileSync(FILE));
}

function saveWallets(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Netstillingar fyrir email (úr umhverfisbreytum)
const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Heimaslóð
app.get("/", (req, res) => {
  res.send("StealthPay backend keyrir ✅");
});

// Skráning
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vantar nafn, netfang eða lykilorð" });
  }

  // Búa til veski
  const wallet = ethers.Wallet.createRandom();

  // Vista í JSON
  const wallets = loadWallets();
  wallets[email] = {
    name,
    password,
    walletAddress: wallet.address,
    privateKey: wallet.privateKey
  };
  saveWallets(wallets);

  // Senda email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "StealthPay – Nýtt veski",
    text: `Halló ${name}!\n\nVeskið þitt:\n\nWallet Address: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\n\nVistaðu þetta STRAX.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Villa við sendingu tölvupósts:", error);
    } else {
      console.log("📤 Email sent:", info.response);
    }
  });

  // Skila svörum til vefviðmótsins
  res.json({
    message: "User registered successfully",
    walletAddress: wallet.address,
    privateKey: wallet.privateKey
  });
});

// Keyra server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
