const express = require("express");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3000;

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
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "8f1133001@smtp-brevo.com",
    pass: "2k43tvGT68qlfRHN"
  }
});

app.get("/", (req, res) => {
  res.send("StealthPay backend keyrir með Brevo ✅");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Vantar nafn, netfang eða lykilorð" });
  }

  const wallet = ethers.Wallet.createRandom();

  const wallets = loadWallets();
  wallets[email] = {
    name,
    password,
    walletAddress: wallet.address,
    privateKey: wallet.privateKey
  };
  saveWallets(wallets);

  const mailOptions = {
    from: `"StealthPay" <8f1133001@smtp-brevo.com>`,
    to: email,
    subject: "🎉 Nýtt Burne Veski frá StealthPay",
    text: `
Halló ${name}!

Veskið þitt er tilbúið:

Wallet address:
${wallet.address}

Private key:
${wallet.privateKey}

Vistaðu þetta STRAX – þetta birtist aðeins einu sinni.

Kveðja,
StealthPay liðið
`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Villa við email:", error);
    } else {
      console.log("📨 Email sent:", info.response);
    }
  });

  res.json({
    message: "User registered successfully",
    walletAddress: wallet.address,
    privateKey: wallet.privateKey
  });
});

// Test route – hægt að prófa email sendingu beint
app.get("/test-email", (req, res) => {
  const mailOptions = {
    from: `"StealthPay" <8f1133001@smtp-brevo.com>`,
    to: "8f1133001@smtp-brevo.com",
    subject: "🚀 Prófunarsending frá StealthPay",
    text: "Þetta er prófunarpóstur. Ef þú sérð þetta – þá virkar sendingin!"
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Villa við test email:", error);
      res.status(500).send("Villa við sendingu: " + error.message);
    } else {
      console.log("📨 Test email sent:", info.response);
      res.send("✅ Test email sent: " + info.response);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
