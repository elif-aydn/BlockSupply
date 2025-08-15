import React, { useState, useEffect, useContext, useMemo } from "react";
import { ethers } from "ethers";
import { WalletContext } from "../contexts/WalletContext";
import { ActiveRoleContext } from "../contexts/ActiveRoleContext";
import { PRODUCT_MANAGER_ADDRESS } from "../utils/contractAddress";
import { ProductManagerABI } from "../utils/contractAbis";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";

const BuyerDashboard = () => {
  const { signer, account } = useContext(WalletContext);
  const { activeRole } = useContext(ActiveRoleContext);
  const [selectedTab, setSelectedTab] = useState("products");

  const contract = useMemo(() => {
    return signer
      ? new ethers.Contract(PRODUCT_MANAGER_ADDRESS, ProductManagerABI, signer)
      : null;
  }, [signer]);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const rawAvailable = await contract.getAvailableProducts();
      const available = rawAvailable.map((p) => ({
        id: Number(p.id),
        name: p.name,
        price: ethers.formatEther(p.price),
        priceWei: p.price,
        status: Number(p.status),
      }));

      const rawOrders = await contract.getProductsByBuyer(account);
      const orders = rawOrders.map((p) => ({
        id: Number(p.id),
        name: p.name,
        price: ethers.formatEther(p.price),
        priceWei: p.price,
        status: Number(p.status),
      }));

      setAvailableProducts(available);
      setMyOrders(orders);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Veriler alınamadı",
        text: err.reason || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract, account]);

  const handleBuy = async (productId, priceWei) => {
    try {
      const tx = await contract.buyProduct(productId, { value: priceWei });
      await tx.wait();
      Swal.fire({
        icon: "success",
        title: "Ürün alındı",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: err.reason || err.message,
      });
    }
  };

  const handleConfirm = async (productId) => {
    try {
      const tx = await contract.confirmDelivery(productId);
      await tx.wait();
      Swal.fire({
        icon: "success",
        title: "Teslimat onaylandı",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: err.reason || err.message,
      });
    }
  };

  const renderContent = () => {
    if (loading) return <p>Yükleniyor...</p>;

    const productList = selectedTab === "products" ? availableProducts : myOrders;

    if (productList.length === 0) {
      return (
        <p>
          {selectedTab === "products"
            ? "Henüz satın alınabilir ürün yok."
            : "Henüz siparişiniz yok."}
        </p>
      );
    }

    return productList.map((p) => (
      <ProductCard
        key={p.id}
        product={p}
        onBuy={selectedTab === "products" ? () => handleBuy(p.id, p.priceWei) : undefined}
        onConfirmDelivery={selectedTab === "orders" ? () => handleConfirm(p.id) : undefined}
        showBuyButton={selectedTab === "products" && p.status === 0}
        showConfirmButton={selectedTab === "orders" && p.status === 3}
      />
    ));
  };

  if (activeRole !== "Buyer") {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Lütfen tüketici olarak giriş yapın.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f1f5f9", // arka plan rengi
      }}
    >
      <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
          backgroundColor: "#f8fafc", // içerik arka planı
          width: "100%", // tam genişlik
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#0f172a",
          }}
        >
          {selectedTab === "products"
            ? "Satın Alınabilir Ürünler"
            : "Siparişlerim"}
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
            width: "100%",
            minHeight: "calc(100vh - 100px)", // boş olsa bile sayfayı doldur
            alignItems: "start",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
