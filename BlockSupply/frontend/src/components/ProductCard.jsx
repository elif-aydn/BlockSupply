// src/components/ProductCard.jsx

import React from "react";

const ProductCard = ({ product, onBuy, showBuyButton, onConfirmDelivery, showConfirmButton }) => {
  return (
<div
  style={{
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 0.2s",
    border: "1px solid #e2e8f0",
  }}
>
  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px", color: "#0f172a" }}>
    {product.name}
  </h3>
  <p style={{ fontSize: "1rem", color: "#475569", marginBottom: "12px" }}>
    {product.price} ETH
  </p>
  {showBuyButton && (
    <button
      onClick={onBuy}
      style={{
        backgroundColor: "#16a34a",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
      }}
    >
      Satın Al
    </button>
  )}
  {showConfirmButton && (
    <button
      onClick={onConfirmDelivery}
      style={{
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500",
      }}
    >
      Teslimatı Onayla
    </button>
  )}
</div>

  );
};

export default ProductCard;
