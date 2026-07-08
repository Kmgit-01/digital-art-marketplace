const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

router.get('/my-purchases/:buyerId', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('buyerId', sql.Int, req.params.buyerId)
      .query(`
        SELECT t.TransactionId, t.ArtworkId, t.Amount, t.RoyaltyAmount, t.PaymentStatus, t.TransactionDate,
               a.Title, a.PreviewImageUrl, a.Category
        FROM Transactions t
        JOIN Artworks a ON a.ArtworkId = t.ArtworkId
        WHERE t.BuyerId = @buyerId
        ORDER BY t.TransactionDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/purchase', async (req, res) => {
  const { artworkId, buyerId, paymentRef } = req.body;

  if (!artworkId || !buyerId || !paymentRef) {
    return res.status(400).json({ error: 'Missing required fields: artworkId, buyerId, paymentRef' });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  let inTransaction = false;

  try {
    await transaction.begin();
    inTransaction = true;

    const artworkResult = await transaction.request()
      .input('id', sql.Int, artworkId)
      .query(`
        SELECT *
        FROM Artworks WITH (UPDLOCK, HOLDLOCK)
        WHERE ArtworkId = @id
        AND IsSold = 0
      `);

    const artwork = artworkResult.recordset[0];
    if (!artwork) {
      const error = new Error('Artwork not available');
      error.status = 404;
      throw error;
    }

    const licenseResult = await transaction.request()
      .input('artworkId', sql.Int, artworkId)
      .query(`
        SELECT TOP 1 OwnerId FROM Licenses
        WHERE ArtworkId = @artworkId
        ORDER BY IssuedAt DESC
      `);
    const sellerId = licenseResult.recordset[0]?.OwnerId || artwork.ArtistId;

    if (Number(buyerId) === Number(sellerId)) {
      const error = new Error('You cannot purchase your own artwork');
      error.status = 400;
      throw error;
    }

    const isResale = licenseResult.recordset.length > 0;
    const royaltyAmount = isResale
      ? Number((artwork.Price * 0.25).toFixed(2))
      : 0;
    const sellerPayout = isResale
      ? Number((artwork.Price - royaltyAmount).toFixed(2))
      : artwork.Price;

    const lockResult = await transaction.request()
      .input('artworkId', sql.Int, artworkId)
      .query('UPDATE Artworks SET IsSold = 1 WHERE ArtworkId = @artworkId AND IsSold = 0');

    if (lockResult.rowsAffected[0] === 0) {
      const error = new Error('Artwork was just purchased by someone else');
      error.status = 409;
      throw error;
    }

    const txResult = await transaction.request()
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

    await transaction.request()
      .input('artworkId', sql.Int, artworkId)
      .input('ownerId', sql.Int, buyerId)
      .input('transactionId', sql.Int, transactionId)
      .query(`
        INSERT INTO Licenses (ArtworkId, OwnerId, TransactionId, LicenseType)
        VALUES (@artworkId, @ownerId, @transactionId, 'personal')
      `);

    if (royaltyAmount > 0) {
      await transaction.request()
        .input('artworkId', sql.Int, artworkId)
        .input('artistId', sql.Int, artwork.ArtistId)
        .input('transactionId', sql.Int, transactionId)
        .input('amount', sql.Decimal(10, 2), royaltyAmount)
        .query(`
          INSERT INTO Royalties (ArtworkId, ArtistId, TransactionId, Amount)
          VALUES (@artworkId, @artistId, @transactionId, @amount)
        `);
    }

    await transaction.commit();
    inTransaction = false;

    res.status(201).json({ transactionId, royaltyAmount, sellerPayout, isResale });
  } catch (err) {
    if (inTransaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr.message);
      }
    }
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
