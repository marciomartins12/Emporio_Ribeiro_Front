const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obter todos os produtos
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    
    // Converter campos numéricos para números
    const formattedProducts = products.map(product => ({
      ...product,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
      stock: parseInt(product.stock)
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Obter produtos em destaque
router.get('/featured', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.featured = TRUE
    `);
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos em destaque' });
  }
});

// Obter produto por ID
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

// Obter produtos por categoria
router.get('/category/:slug', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.slug = ?
    `, [req.params.slug]);
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos por categoria' });
  }
});

// Adicionar um novo produto (requer autenticação de admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, discount_price, image, category_id, stock, featured, barcode } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO products (name, description, price, discount_price, image, category_id, stock, featured, barcode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, price, discount_price, image, category_id, stock, featured, barcode]);
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Produto adicionado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).json({ message: 'Erro ao adicionar produto' });
  }
});

// Atualizar um produto
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, discount_price, image, category_id, stock, featured, barcode } = req.body;
    
    await db.query(`
      UPDATE products
      SET name = ?, description = ?, price = ?, discount_price = ?,
          image = ?, category_id = ?, stock = ?, featured = ?, barcode = ?
      WHERE id = ?
    `, [name, description, price, discount_price, image, category_id, stock, featured, barcode, req.params.id]);
    
    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});

// Excluir um produto
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
});

module.exports = router;
