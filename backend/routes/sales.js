const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { authenticateToken } = require('../middleware/auth');

// Criar uma nova venda
router.post('/', async (req, res) => {
  try {
    const saleData = req.body;
    
    // Validar dados da venda
    if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({ message: 'Itens da venda são obrigatórios' });
    }
    
    if (typeof saleData.total !== 'number' || saleData.total <= 0) {
      return res.status(400).json({ message: 'Total da venda inválido' });
    }
    
    // Adicionar ID do usuário se autenticado
    if (req.user) {
      saleData.userId = req.user.id;
    }
    
    const sale = await Sale.create(saleData);
    res.status(201).json(sale);
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ message: 'Erro ao processar a venda', error: error.message });
  }
});

// Buscar todas as vendas
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Filtrar por período se fornecido
    if (req.query.startDate && req.query.endDate) {
      const sales = await Sale.getByDateRange(req.query.startDate, req.query.endDate);
      return res.json(sales);
    }
    
    const sales = await Sale.getAll();
    res.json(sales);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
  }
});

// Buscar uma venda específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.getById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error(`Erro ao buscar venda com ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar venda', error: error.message });
  }
});

// Cancelar uma venda
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.getById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    
    if (sale.status === 'cancelled') {
      return res.status(400).json({ message: 'Esta venda já foi cancelada' });
    }
    
    const cancelledSale = await Sale.cancelSale(req.params.id);
    res.json(cancelledSale);
  } catch (error) {
    console.error(`Erro ao cancelar venda com ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao cancelar venda', error: error.message });
  }
});

module.exports = router;
