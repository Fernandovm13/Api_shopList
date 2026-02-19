const express = require('express');
const http = require('http');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes');
const { startWSS } = require('./ws/ws-Server');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', listRoutes);

const server = http.createServer(app);
startWSS(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`ShopList API activa en puerto ${PORT}`));