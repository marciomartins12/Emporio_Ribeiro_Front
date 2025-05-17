const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { authenticateToken } = require('../middleware/auth');

// Criar uma nova venda
router.post('/', async (req, res) => {
  try {
    const saleData = req.body;
    
    console.log("Dados recebidos na rota:", saleData);
    
    // Validar dados da venda
    if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({ message: 'Itens da venda são obrigatórios' });
    }
    
    if (typeof saleData.total !== 'number' || saleData.total <= 0) {
      return res.status(400).json({ message: 'Total da venda inválido' });
    }
    
    // Garantir que o método de pagamento seja válido
    if (!saleData.payment_method) {
      saleData.payment_method = 'cash'; // Define um valor padrão
      console.log("Método de pagamento não fornecido, usando padrão:", saleData.payment_method);
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

// Obter relatório de vendas por período
router.get('/reports/by-period', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Datas de início e fim são obrigatórias' });
    }
    
    const sales = await Sale.getByDateRange(startDate, endDate);
    
    // Calcular totais
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalItems = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    // Agrupar por método de pagamento
    const paymentMethods = {
      cash: { count: 0, total: 0 },
      credit_card: { count: 0, total: 0 },
      pix: { count: 0, total: 0 }
    };
    
    sales.forEach(sale => {
      const method = sale.payment_method;
      if (paymentMethods[method]) {
        paymentMethods[method].count += 1;
        paymentMethods[method].total += parseFloat(sale.total);
      }
    });
    
    res.json({
      period: { startDate, endDate },
      summary: {
        totalSales,
        totalRevenue,
        totalItems,
        paymentMethods
      },
      sales
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
  }
});

// Obter relatório de vendas por produto
router.get('/reports/by-product', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Datas de início e fim são obrigatórias' });
    }
    
    const sales = await Sale.getByDateRange(startDate, endDate);
    
    // Agrupar por produto
    const productSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product_id;
        const productName = item.product_name;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName,
            quantity: 0,
            totalRevenue: 0,
            salesCount: 0
          };
        }
        
        productSales[productId].quantity += item.quantity;
        productSales[productId].totalRevenue += parseFloat(item.total_price);
        productSales[productId].salesCount += 1;
      });
    });
    
    res.json({
      period: { startDate, endDate },
      products: Object.values(productSales).sort((a, b) => b.totalRevenue - a.totalRevenue)
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
  }
});

module.exports = router;
