const express = require('express');
const cors = require('cors');
require('dotenv').config();

const artworkRoutes = require('./routes/artworks');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../client/dist'));

app.get('/api/health-check', (req, res) => {
  res.send('Digital Art Marketplace API is running');
});

app.use('/api/artworks', artworkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '../client/dist' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
