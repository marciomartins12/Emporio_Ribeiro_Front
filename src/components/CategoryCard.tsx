import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={`/products/category/${category.slug}`} className="category-card">
      <div className="category-image">
        <img src={category.image} alt={category.name} />
      </div>
      <h3>{category.name}</h3>
    </Link>
  );
};

export default CategoryCard;