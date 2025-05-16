import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number | string;
    discount_price: number | string | null;
    image: string;
    category_name: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Converter preços para números para garantir que toFixed funcione
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const discountPrice = product.discount_price 
    ? (typeof product.discount_price === 'string' 
       ? parseFloat(product.discount_price) 
       : product.discount_price)
    : null;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-info">
          <h3>{product.name}</h3>
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
        </div>
      </Link>
      
      <button className="add-to-cart">Adicionar ao Carrinho</button>
    </div>
  );
};

export default ProductCard;