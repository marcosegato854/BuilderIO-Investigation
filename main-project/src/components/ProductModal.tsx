import React, { useEffect } from "react";
import "./ProductModal.css";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2).replace(".", ",")}€`;
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-content">
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_9_345)">
                <path
                  d="M12 -0.000244141C5.31429 -0.000244141 0 5.31404 0 11.9998C0 18.6855 5.31429 23.9998 12 23.9998C18.6857 23.9998 24 18.6855 24 11.9998C24 5.31404 18.6857 -0.000244141 12 -0.000244141ZM16.6286 17.9998L12 13.3712L7.37143 17.9998L6 16.6283L10.6286 11.9998L6 7.37118L7.37143 5.99976L12 10.6283L16.6286 5.99976L18 7.37118L13.3714 11.9998L18 16.6283L16.6286 17.9998Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_9_345">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>

          <div className="modal-body">
            <div className="modal-image-container">
              <img
                src={product.image}
                alt={product.name}
                className="modal-image"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://cdn.builder.io/api/v1/image/assets/TEMP/f6b984d857c321bfc3d61db0bd3d1b2aa5d8954f?width=984";
                }}
              />
            </div>

            <div className="modal-info">
              <div className="modal-product-name">{product.name}</div>
              <div className="modal-product-price">
                {formatPrice(product.price)}
              </div>
              <div className="modal-product-category">{product.category}</div>
              <div className="modal-description-container">
                <div className="modal-product-description">
                  {product.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
