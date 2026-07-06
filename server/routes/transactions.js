const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

router.post('/purchase', async (req, res) => {
  const { artworkId, buyerId, paymentRef } = req.body;

  try {
    const pool = await getPool();

    const artworkResult = await pool.request()
      .input('id', sql.Int, artworkId)
      .query('SELECT * FROM Artworks WHERE ArtworkId = @id AND IsSold = 0');

    const artwork = artworkResult.recordset[0];
    if (!artwork) return res.status(404).json({ error: 'Artwork not available' });

    const licenseResult = await pool.request()
      .input('artworkId', sql.Int, artworkId)
      .query(`
        SELECT TOP 1 OwnerId FROM Licenses
        WHERE ArtworkId = @artworkId
        ORDER BY IssuedAt DESC
      `);
    const sellerId = licenseResult.recordset[0]?.OwnerId || artwork.ArtistId;
    const isResale = licenseResult.recordset.length > 0;

    const royaltyAmount = isResale
      ? Number((artwork.Price * (artwork.RoyaltyPercent / 100)).toFixed(2))
      : 0;

    const txResult = await pool.request()
      .input('artworkId', sql.Int, artworkId)
      .input('buyerId', sql.Int, buyerId)
      .input('sellerId', sql.Int, sellerId)
      .input('amount', sql.Decimal(10, 2), artwork.Price)
      .input('royaltyAmount', sql.Decimal(10, 2), royaltyAmount)
      .input('paymentRef', sql.NVarChar, paymentRef)
      .query(`
        INSERT INTO Transactions (ArtworkId, BuyerId, SellerId, Amount, RoyaltyAmount, PaymentStatus, PaymentRef)
        OUTPUT INSERTED.TransactionId
        VALUES (@artworkId, @buyerId, @sellerId, @amount, @royaltyAmount, 'completed', @paymentRef)
      `);
    const transactionId = txResult.recordset[0].TransactionId;

    await pool.request()
      .input('artworkId', sql.Int, artworkId)
      .input('ownerId', sql.Int, buyerId)
      .input('transactionId', sql.Int, transactionId)
      .query(`
        INSERT INTO Licenses (ArtworkId, OwnerId, TransactionId, LicenseType)
        VALUES (@artworkId, @ownerId, @transactionId, 'personal')
      `);

    if (royaltyAmount > 0) {
      await pool.request()
        .input('artworkId', sql.Int, artworkId)
        .input('artistId', sql.Int, artwork.ArtistId)
        .input('transactionId', sql.Int, transactionId)
        .input('amount', sql.Decimal(10, 2), royaltyAmount)
        .query(`
          INSERT INTO Royalties (ArtworkId, ArtistId, TransactionId, Amount)
          VALUES (@artworkId, @artistId, @transactionId, @amount)
        `);
    }

    await pool.request()
      .input('artworkId', sql.Int, artworkId)
      .query('UPDATE Artworks SET IsSold = 1 WHERE ArtworkId = @artworkId');

    res.status(201).json({ transactionId, royaltyAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
