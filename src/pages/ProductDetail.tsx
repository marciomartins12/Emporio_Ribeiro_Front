import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(Number(id));
        setProduct(productData);
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError('Falha ao carregar o produto. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    // Lógica para adicionar ao carrinho
    console.log(`Adicionando ${quantity} unidades do produto ${product.id} ao carrinho`);
    // Implementar lógica de carrinho
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="not-found">Produto não encontrado</div>;

  // Converter preços para números
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const discountPrice = product.discount_price 
    ? (typeof product.discount_price === 'string' 
       ? parseFloat(product.discount_price) 
       : product.discount_price)
    : null;

  return (
    <div className="product-detail">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="category">{product.category_name}</p>
        
        <div className="price-container">
          {discountPrice ? (
            <>
              <span className="original-price">R$ {price.toFixed(2)}</span>
              <span className="discount-price">R$ {discountPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="price">R$ {price.toFixed(2)}</span>
          )}
        </div>
        
        <div className="description">
          <h3>Descrição</h3>
          <p>{product.description}</p>
        </div>
        
        <div className="quantity-selector">
          <button 
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span>{quantity}</span>
          <button 
            onClick={() => setQuantity(prev => prev + 1)}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
        
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
        </button>
        
        <div className="stock-info">
          {product.stock > 0 ? (
            <p>Em estoque: {product.stock} unidades</p>
          ) : (
            <p className="out-of-stock">Produto fora de estoque</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;