const express = require('express');
const multer = require('multer');
const router = express.Router();
const { sql, getPool } = require('../db');
const { uploadOriginalArt, uploadPreviewArt } = require('../blobStorage');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT ArtworkId, ArtistId, Title, Description, Category, Price,
             PreviewImageUrl, IsSold, CreatedAt
      FROM Artworks
      WHERE IsSold = 0
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-uploads/:artistId', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('artistId', sql.Int, req.params.artistId)
      .query(`
        SELECT ArtworkId, Title, Description, Category, Price,
               PreviewImageUrl, IsSold, CreatedAt
        FROM Artworks
        WHERE ArtistId = @artistId
        ORDER BY CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/resell', async (req, res) => {
  try {
    const { ownerId, newPrice } = req.body;
    const pool = await getPool();

    // Verify this person actually owns the current license for this artwork
    const licenseResult = await pool.request()
      .input('artworkId', sql.Int, req.params.id)
      .query(`
        SELECT TOP 1 OwnerId FROM Licenses
        WHERE ArtworkId = @artworkId
        ORDER BY IssuedAt DESC
      `);
    const currentOwner = licenseResult.recordset[0]?.OwnerId;

    if (!currentOwner || currentOwner !== Number(ownerId)) {
      return res.status(403).json({ error: 'You do not own a license for this artwork' });
    }

    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('price', sql.Decimal(10, 2), newPrice)
      .query(`
        UPDATE Artworks
        SET IsSold = 0, Price = COALESCE(@price, Price)
        WHERE ArtworkId = @id
      `);

    res.json({ message: 'Artwork relisted for resale' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT c.CommentId, c.Content, c.CreatedAt, c.UserId, u.FullName, u.Role
        FROM Comments c
        INNER JOIN Users u ON u.UserId = c.UserId
        WHERE c.ArtworkId = @id
        ORDER BY c.CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, content } = req.body;

    if (!userId || !content?.trim()) {
      return res.status(400).json({ error: 'Please provide a comment' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('artworkId', sql.Int, req.params.id)
      .input('userId', sql.Int, userId)
      .input('content', sql.NVarChar(1000), content.trim())
      .query(`
        INSERT INTO Comments (ArtworkId, UserId, Content)
        OUTPUT INSERTED.CommentId, INSERTED.CreatedAt
        VALUES (@artworkId, @userId, @content)
      `);

    res.status(201).json({
      commentId: result.recordset[0].CommentId,
      createdAt: result.recordset[0].CreatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Artworks WHERE ArtworkId = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.fields([{ name: 'original' }, { name: 'preview' }]), async (req, res) => {
  try {
    const { title, description, category, price, artistId } = req.body;
    const originalFile = req.files['original'][0];
    const previewFile = req.files['preview'][0];

    const originalUrl = await uploadOriginalArt(
      `${Date.now()}-${originalFile.originalname}`,
      originalFile.buffer,
      originalFile.mimetype
    );
    const previewUrl = await uploadPreviewArt(
      `${Date.now()}-${previewFile.originalname}`,
      previewFile.buffer,
      previewFile.mimetype
    );

    const pool = await getPool();
    const result = await pool.request()
      .input('artistId', sql.Int, artistId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('category', sql.NVarChar, category)
      .input('price', sql.Decimal(10, 2), price)
      .input('originalUrl', sql.NVarChar, originalUrl)
      .input('previewUrl', sql.NVarChar, previewUrl)
      .query(`
        INSERT INTO Artworks (ArtistId, Title, Description, Category, Price, OriginalFileUrl, PreviewImageUrl)
        OUTPUT INSERTED.ArtworkId
        VALUES (@artistId, @title, @description, @category, @price, @originalUrl, @previewUrl)
      `);

    res.status(201).json({ artworkId: result.recordset[0].ArtworkId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
