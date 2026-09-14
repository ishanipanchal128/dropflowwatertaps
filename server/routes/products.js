const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();

const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');
const CATEGORIES_PATH = path.join(__dirname, '..', 'data', 'categories.json');

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

// GET /api/products - full product catalog (matches CATALOG_PRODUCTS shape used as fallback)
router.get('/products', async (req, res) => {
  try {
    const products = await readJsonFile(PRODUCTS_PATH);
    res.json(products);
  } catch (err) {
    console.error('Failed to read products.json:', err.message);
    res.status(500).json({ error: 'Unable to load products right now.' });
  }
});

// GET /api/categories - full category list (matches CATALOG_CATEGORIES shape used as fallback)
router.get('/categories', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_PATH);
    res.json(categories);
  } catch (err) {
    console.error('Failed to read categories.json:', err.message);
    res.status(500).json({ error: 'Unable to load categories right now.' });
  }
});

module.exports = router;
