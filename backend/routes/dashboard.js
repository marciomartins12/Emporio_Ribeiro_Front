const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Rota para obter dados do dashboard
router.get('/', async (req, res) => {
  try {
    console.log("Requisição recebida na rota de dashboard");
    const { startDate, endDate } = req.query;
    
    console.log(`Parâmetros recebidos: startDate=${startDate}, endDate=${endDate}`);
    
    if (!startDate || !endDate) {
      console.log("Erro: Datas de início e fim são obrigatórias");
      return res.status(400).json({ message: 'Datas de início e fim são obrigatórias' });
    }
    
    // Buscar vendas no período
    console.log("Buscando vendas no período...");
    const sales = await Sale.getByDateRange(startDate, endDate);
    console.log(`Encontradas ${sales.length} vendas no período`);
    
    // Buscar produtos
    console.log("Buscando produtos...");
    const products = await Product.getAll();
    console.log(`Encontrados ${products.length} produtos`);
    
    // Calcular produtos com estoque baixo
    const lowStockProducts = products.filter(product => product.stock <= product.min_stock);
    console.log(`${lowStockProducts.length} produtos com estoque baixo`);
    
    // Calcular totais
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    console.log(`Total de vendas: ${totalSales}, Receita total: ${totalRevenue}`);
    
    // Agrupar por método de pagamento
    console.log("Buscando vendas por método de pagamento...");
    const salesByPaymentMethod = await Sale.getSalesByPaymentMethod(startDate, endDate);
    console.log("Métodos de pagamento:", salesByPaymentMethod);
    
    // Buscar produtos mais vendidos
    console.log("Buscando produtos mais vendidos...");
    const topSellingProducts = await Sale.getTopSellingProducts(startDate, endDate, 10);
    console.log(`Encontrados ${topSellingProducts.length} produtos mais vendidos`);
    
    // Buscar vendas diárias
    console.log("Buscando vendas diárias...");
    const dailySales = await Sale.getDailySales(startDate, endDate);
    console.log(`Encontrados dados de vendas para ${dailySales.length} dias`);
    
    // Buscar vendas recentes
    const recentSales = sales.slice(0, 5);
    
    const responseData = {
      summary: {
        totalSales,
        totalRevenue,
        totalProducts: products.length,
        lowStockProducts: lowStockProducts.length
      },
      salesByPaymentMethod,
      topSellingProducts,
      dailySales,
      recentSales
    };
    
    console.log("Enviando resposta com dados do dashboard");
    res.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard', error: error.message });
  }
});

module.exports = router;
