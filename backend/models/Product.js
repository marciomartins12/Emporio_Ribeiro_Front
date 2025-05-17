const db = require('../config/db');

class Product {
  static async getAll() {
    try {
      const [products] = await db.query(
        `SELECT * FROM products ORDER BY name`
      );
      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [products] = await db.query(
        `SELECT * FROM products WHERE id = ?`,
        [id]
      );
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`Erro ao buscar produto com ID ${id}:`, error);
      throw error;
    }
  }

  static async getByBarcode(barcode) {
    try {
      const [products] = await db.query(
        `SELECT * FROM products WHERE barcode = ?`,
        [barcode]
      );
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`Erro ao buscar produto com código de barras ${barcode}:`, error);
      throw error;
    }
  }

  static async create(productData) {
    try {
      const [result] = await db.query(
        `INSERT INTO products 
        (name, barcode, category, cost_price, selling_price, stock, min_stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.name,
          productData.barcode,
          productData.category,
          productData.costPrice,
          productData.sellingPrice,
          productData.stock,
          productData.minStock
        ]
      );
      return await this.getById(result.insertId);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  static async update(id, productData) {
    try {
      await db.query(
        `UPDATE products 
        SET name = ?, barcode = ?, category = ?, cost_price = ?, 
        selling_price = ?, stock = ?, min_stock = ? 
        WHERE id = ?`,
        [
          productData.name,
          productData.barcode,
          productData.category,
          productData.costPrice,
          productData.sellingPrice,
          productData.stock,
          productData.minStock,
          id
        ]
      );
      return await this.getById(id);
    } catch (error) {
      console.error(`Erro ao atualizar produto com ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Verificar se o produto está em alguma venda
      const [saleItems] = await db.query(
        `SELECT * FROM sale_items WHERE product_id = ? LIMIT 1`,
        [id]
      );
      
      if (saleItems.length > 0) {
        throw new Error('Não é possível excluir um produto que está em vendas');
      }
      
      await db.query(
        `DELETE FROM products WHERE id = ?`,
        [id]
      );
      return { id };
    } catch (error) {
      console.error(`Erro ao excluir produto com ID ${id}:`, error);
      throw error;
    }
  }

  static async updateStock(id, quantity) {
    try {
      await db.query(
        `UPDATE products SET stock = stock + ? WHERE id = ?`,
        [quantity, id]
      );
      return await this.getById(id);
    } catch (error) {
      console.error(`Erro ao atualizar estoque do produto com ID ${id}:`, error);
      throw error;
    }
  }

  static async search(query) {
    try {
      const [products] = await db.query(
        `SELECT * FROM products 
        WHERE name LIKE ? OR barcode LIKE ? OR category LIKE ?
        ORDER BY name`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
      return products;
    } catch (error) {
      console.error(`Erro ao buscar produtos com query "${query}":`, error);
      throw error;
    }
  }

  static async getLowStock() {
    try {
      const [products] = await db.query(
        `SELECT * FROM products 
        WHERE stock <= min_stock
        ORDER BY (min_stock - stock) DESC`
      );
      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }
}

module.exports = Product;
