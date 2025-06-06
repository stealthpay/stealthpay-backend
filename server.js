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
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get("/", (req, res) => {
  res.send("StealthPay backend is live");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nafn, netfang og lykilorð vantar" });
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
    from: process.env.EMAIL_USER,
    to: email,
    subject: "StealthPay - Veski stofnað",
    text: `Halló ${name}!\n\nVeskið þitt er tilbúið:\n\nWallet address: ${wallet.address}\nPrivate key: ${wallet.privateKey}\n\nEkki deila þessu með neinum!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email villa:", error);
    } else {
      console.log("Sendt email:", info.response);
    }
  });

  res.json({
    message: "Notandi skráður og veski stofnað",
    walletAddress: wallet.address,
    privateKey: wallet.privateKey
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
