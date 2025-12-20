// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessionsPath = path.join(__dirname, 'sessions');

app.get('/api/get-code', async (req, res) => {
  try {
    const phoneNumber = req.query.number;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number required!' });

    const { state, saveCreds } = await useMultiFileAuthState(path.join(sessionsPath, phoneNumber));

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    // Generate pairing code
    const code = await sock.requestPairingCode(phoneNumber);

    // Save credentials automatically when received
    sock.ev.on('creds.update', saveCreds);

    res.json({ pairingCode: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Toxic.a.n.-MD Server running on port ${PORT}`));