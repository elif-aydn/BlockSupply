// src/components/Sidebar.jsx
import React, { useContext } from "react";
import { ActiveRoleContext } from "../contexts/ActiveRoleContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ selectedTab, setSelectedTab }) => {
  const { activeRole } = useContext(ActiveRoleContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const roleTabs = {
    Buyer: [
      { label: "Ürünler", key: "products" },
      { label: "Siparişlerim", key: "orders" },
    ],
    Producer: [
      { label: "Ürün Oluştur", key: "create" },
      { label: "Ürünlerim", key: "myProducts" },
    ],
    Shipper: [
      { label: "Teklif Verilebilecek Ürünler", key: "toOffer" },
      { label: "Bekleyen Nakliye Talepleri", key: "pending" },
      { label: "Kabul Edilen Nakliyeler", key: "assigned" },
      { label: "Reddedilen Talepler", key: "rejected" },
    ],
  };

  const items = roleTabs[activeRole] || [];

  const panelTitle =
    activeRole === "Buyer"
      ? "Müşteri Paneli"
      : activeRole === "Producer"
      ? "Üretici Paneli"
      : activeRole === "Shipper"
      ? "Nakliyeci Paneli"
      : "Panel";

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#1e293b",
        color: "#e2e8f0",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#c5cee3ff", marginBottom: 28 }}>{panelTitle}</h2>

      {items.map((item) => (
        <div
          key={item.key}
          onClick={() => setSelectedTab(item.key)}
          style={{
            padding: "12px 14px",
            backgroundColor: selectedTab === item.key ? "#334155" : "transparent",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "14px",
            fontWeight: 500,
          }}
        >
          {item.label}
        </div>
      ))}

      <hr style={{ borderColor: "#6e87a9ff", margin: "30px 0" }} />

      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#ef4444",
          color: "white",
          padding: "12px 14px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          fontWeight: "bold",
        }}
      >
        Çıkış Yap
      </button>
    </div>
  );
};

export default Sidebar;
