const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/attachments', attachmentRoutes);

// Any /api/* route that wasn't matched above is a real 404, not a client-side route.
app.use('/api', (req, res) => res.status(404).json({ message: 'Risorsa non trovata.' }));

// In production the client is built into client/dist and copied next to the
// server (see the root Dockerfile) so one Railway service serves both the
// API and the SPA — no separate static host or CORS setup needed.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.use((req, res) => res.status(404).json({ message: 'Risorsa non trovata.' }));
}

// Express 5 forwards rejected promises from async handlers here automatically.
app.use(errorHandler);

module.exports = app;
