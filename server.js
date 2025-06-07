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

// 🟢 Brevo auth úr einni breytu
const [user, pass] = process.env.BREVO_AUTH.split(":");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: { user, pass }
});

app.get("/", (req, res) => {
  res.send("✅ StealthPay backend keyrir með Brevo email.");
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
    from: `"StealthPay" <${user}>`,
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

app.get("/test-email", (req, res) => {
  const mailOptions = {
    from: `"StealthPay" <${user}>`,
    to: user,
    subject: "🚀 Prófunarpóstur frá StealthPay",
    text: "Ef þú sérð þetta – þá virkar email sendingin!"
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
