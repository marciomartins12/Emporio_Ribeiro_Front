const db = require('../config/db');

class Sale {
  static async create(saleData) {
    try {
      // Iniciar transação
      await db.query('START TRANSACTION');

      // Inserir a venda
      const [saleResult] = await db.query(
        `INSERT INTO sales 
        (total, payment_method, cash_received, change_amount, status, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleData.total,
          saleData.paymentMethod,
          saleData.cashReceived || null,
          saleData.change || null,
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
            item.productId,
            item.productName,
            item.quantity,
            item.unitPrice,
            item.totalPrice
          ]
        );

        // Atualizar o estoque do produto
        await db.query(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.productId]
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
      const [sales] = await db.query(
        `SELECT * FROM sales 
         WHERE created_at BETWEEN ? AND ? 
         ORDER BY created_at DESC`,
        [startDate, endDate]
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
}

module.exports = Sale;
