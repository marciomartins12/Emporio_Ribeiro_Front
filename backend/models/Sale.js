const db = require('../config/db');

class Sale {
  static async create(saleData) {
    try {
      // Iniciar transação
      await db.query('START TRANSACTION');

      // Garantir que o método de pagamento seja válido
      const paymentMethod = saleData.payment_method || 'cash';
      
      console.log("Dados para inserção na tabela sales:", {
        total: saleData.total,
        paymentMethod: paymentMethod,
        cashReceived: saleData.cash_received,
        changeAmount: saleData.change_amount
      });

      // Inserir a venda
      const [saleResult] = await db.query(
        `INSERT INTO sales 
        (total, payment_method, cash_received, change_amount, status, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleData.total,
          paymentMethod, // Usar o valor validado
          saleData.cash_received || null,
          saleData.change_amount || null,
          'completed',
          saleData.userId || null
        ]
      );

      const saleId = saleResult.insertId;

      // Inserir os itens da venda
      for (const item of saleData.items) {
        await db.query(
          `INSERT INTO sale_items 
          (sale_id, product_id, product_name, quantity, unit_price, total_price) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            saleId,
            item.product_id,
            item.product_name,
            item.quantity,
            item.unit_price,
            item.total_price
          ]
        );

        // Atualizar o estoque do produto
        await db.query(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      // Commit da transação
      await db.query('COMMIT');

      // Buscar a venda completa com seus itens
      return await this.getById(saleId);
    } catch (error) {
      // Rollback em caso de erro
      await db.query('ROLLBACK');
      console.error('Erro ao criar venda:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const [sales] = await db.query(
        `SELECT * FROM sales ORDER BY created_at DESC`
      );

      // Para cada venda, buscar seus itens
      for (let sale of sales) {
        const [items] = await db.query(
          `SELECT * FROM sale_items WHERE sale_id = ?`,
          [sale.id]
        );
        sale.items = items;
      }

      return sales;
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [sales] = await db.query(
        `SELECT * FROM sales WHERE id = ?`,
        [id]
      );

      if (sales.length === 0) {
        return null;
      }

      const sale = sales[0];

      // Buscar os itens da venda
      const [items] = await db.query(
        `SELECT * FROM sale_items WHERE sale_id = ?`,
        [id]
      );

      sale.items = items;
      return sale;
    } catch (error) {
      console.error(`Erro ao buscar venda com ID ${id}:`, error);
      throw error;
    }
  }

  static async getByDateRange(startDate, endDate) {
    try {
      // Ajustar a data final para incluir todo o dia
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      
      const [sales] = await db.query(
        `SELECT * FROM sales 
         WHERE created_at BETWEEN ? AND ? 
         ORDER BY created_at DESC`,
        [startDate, adjustedEndDate.toISOString().split('T')[0] + ' 23:59:59']
      );

      // Para cada venda, buscar seus itens
      for (let sale of sales) {
        const [items] = await db.query(
          `SELECT * FROM sale_items WHERE sale_id = ?`,
          [sale.id]
        );
        sale.items = items;
      }

      return sales;
    } catch (error) {
      console.error('Erro ao buscar vendas por período:', error);
      throw error;
    }
  }

  static async cancelSale(id) {
    try {
      // Iniciar transação
      await db.query('START TRANSACTION');

      // Buscar os itens da venda
      const [items] = await db.query(
        `SELECT * FROM sale_items WHERE sale_id = ?`,
        [id]
      );

      // Devolver os itens ao estoque
      for (const item of items) {
        await db.query(
          `UPDATE products SET stock = stock + ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      // Atualizar o status da venda
      await db.query(
        `UPDATE sales SET status = 'cancelled' WHERE id = ?`,
        [id]
      );

      // Commit da transação
      await db.query('COMMIT');

      return await this.getById(id);
    } catch (error) {
      // Rollback em caso de erro
      await db.query('ROLLBACK');
      console.error(`Erro ao cancelar venda com ID ${id}:`, error);
      throw error;
    }
  }

  static async getSalesByPaymentMethod(startDate, endDate) {
    try {
      const [results] = await db.query(
        `SELECT payment_method, COUNT(*) as count, SUM(total) as total_amount
         FROM sales
         WHERE created_at BETWEEN ? AND ?
         AND status = 'completed'
         GROUP BY payment_method`,
        [startDate, endDate]
      );
      
      return results;
    } catch (error) {
      console.error('Erro ao buscar vendas por método de pagamento:', error);
      throw error;
    }
  }

  static async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      const [results] = await db.query(
        `SELECT si.product_id, si.product_name, 
         SUM(si.quantity) as total_quantity,
         SUM(si.total_price) as total_revenue
         FROM sale_items si
         JOIN sales s ON si.sale_id = s.id
         WHERE s.created_at BETWEEN ? AND ?
         AND s.status = 'completed'
         GROUP BY si.product_id, si.product_name
         ORDER BY total_quantity DESC
         LIMIT ?`,
        [startDate, endDate, limit]
      );
      
      return results;
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      throw error;
    }
  }

  static async getDailySales(startDate, endDate) {
    try {
      const [results] = await db.query(
        `SELECT DATE(created_at) as date, 
         COUNT(*) as sales_count,
         SUM(total) as total_amount
         FROM sales
         WHERE created_at BETWEEN ? AND ?
         AND status = 'completed'
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [startDate, endDate]
      );
      
      return results;
    } catch (error) {
      console.error('Erro ao buscar vendas diárias:', error);
      throw error;
    }
  }
}

module.exports = Sale;