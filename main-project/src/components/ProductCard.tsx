import React from "react";
import "./ProductCard.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card">
      <div className="card-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="card-image"
          onError={(e) => {
            // Fallback to a placeholder image if the image fails to load
            e.currentTarget.src =
              "https://cdn.builder.io/api/v1/image/assets/TEMP/f6b984d857c321bfc3d61db0bd3d1b2aa5d8954f?width=984";
          }}
        />
      </div>
      <div className="card-overlay">
        <div className="card-content">
          <div className="product-info">
            <div className="product-name">{product.name}</div>
            <div className="product-category">{product.category}</div>
          </div>
          <div className="product-price">
            €{product.price.toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
