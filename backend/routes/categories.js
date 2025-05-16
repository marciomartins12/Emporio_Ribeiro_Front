const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obter todas as categorias
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
});

// Obter categoria por slug
router.get('/:slug', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    res.json(categories[0]);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar categoria' });
  }
});

// Adicionar uma nova categoria
router.post('/', async (req, res) => {
  try {
    const { name, slug, image } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO categories (name, slug, image)
      VALUES (?, ?, ?)
    `, [name, slug, image]);
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Categoria adicionada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    res.status(500).json({ message: 'Erro ao adicionar categoria' });
  }
});

// Atualizar uma categoria
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, image } = req.body;
    
    await db.query(`
      UPDATE categories
      SET name = ?, slug = ?, image = ?
      WHERE id = ?
    `, [name, slug, image, req.params.id]);
    
    res.json({ message: 'Categoria atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
});

// Excluir uma categoria
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ message: 'Erro ao excluir categoria' });
  }
});

module.exports = router;
