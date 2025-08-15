// src/pages/ProducerDashboard.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { WalletContext } from "../contexts/WalletContext";
import { ActiveRoleContext } from "../contexts/ActiveRoleContext";
import { PRODUCT_MANAGER_ADDRESS, SHIPPING_MANAGER_ADDRESS } from "../utils/contractAddress";
import { ProductManagerABI, ShippingManagerABI } from "../utils/contractAbis";
import Sidebar from "../components/Sidebar";

const ProducerDashboard = () => {
  const { signer, account } = useContext(WalletContext);
  const { activeRole } = useContext(ActiveRoleContext);

  const [selectedTab, setSelectedTab] = useState("create"); // create veya myProducts

  const productContract = useMemo(
    () => signer && new ethers.Contract(PRODUCT_MANAGER_ADDRESS, ProductManagerABI, signer),
    [signer]
  );

  const shipContract = useMemo(
    () => signer && new ethers.Contract(SHIPPING_MANAGER_ADDRESS, ShippingManagerABI, signer),
    [signer]
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(false);

  if (activeRole !== "Producer") {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Bu sayfaya erişim izniniz yok. Lütfen üretici olarak giriş yapın.
      </p>
    );
  }

  const loadData = async () => {
    if (!productContract || !shipContract || !account) return;
    setLoading(true);
    try {
      const raw = await productContract.getProductsByProducer(account);
      const formatted = raw.map((p) => ({
        id: Number(p.id),
        name: p.name,
        price: ethers.formatEther(p.price),
        status: Number(p.status),
      }));
      setProducts(formatted);

      const reqs = {};
      for (let p of formatted) {
        if (p.status === 1) {
          const arr = await shipContract.getShippingRequests(p.id);
          reqs[p.id] = arr;
        }
      }
      setRequests(reqs);
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
    loadData();
  }, [productContract, shipContract, account]);

  const createProduct = async () => {
    if (!name || !price) {
      return Swal.fire({
        icon: "warning",
        title: "Lütfen tüm alanları doldurun",
        timer: 2000,
        showConfirmButton: false,
      });
    }
    try {
      const tx = await productContract.createProduct(name, ethers.parseEther(price));
      await tx.wait();
      setName("");
      setPrice("");
      loadData();
      Swal.fire({
        icon: "success",
        title: "Ürün başarıyla oluşturuldu",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oluşturma başarısız",
        text: err.reason || err.message,
      });
    }
  };

  const acceptRequest = async (productId, shipperAddr) => {
    try {
      const tx = await productContract.assignShipper(productId, shipperAddr);
      await tx.wait();
      Swal.fire({
        icon: "success",
        title: "Nakliyeci atandı",
        timer: 2000,
        showConfirmButton: false,
      });
      loadData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Atama başarısız",
        text: err.reason || err.message,
      });
    }
  };

  const rejectRequest = (productId, shipperAddr) => {
    setRequests((prev) => ({
      ...prev,
      [productId]: prev[productId].filter((a) => a !== shipperAddr),
    }));
  };

  const thStyle = { textAlign: "left", padding: "12px", fontWeight: "600", color: "#111827", borderBottom: "2px solid #d1d5db" };
  const tdStyle = { padding: "12px", verticalAlign: "top", color: "#374151" };
  const btnStyleAccept = { padding: "6px 10px", backgroundColor: "#9c99c8ff", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" };
  const btnStyleReject = { padding: "6px 10px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" };

  const renderContent = () => {
    if (loading) return <p>Yükleniyor...</p>;

    if (selectedTab === "create") {
      return (
        <>
          <input
            type="text"
            placeholder="Ürün Adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "12px" }}
          />
          <input
            type="text"
            placeholder="Fiyat (ETH)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", marginBottom: "16px" }}
          />
          <button
            onClick={createProduct}
            style={{ width: "100%", padding: "12px", fontSize: "16px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Oluştur
          </button>
        </>
      );
    }

    if (selectedTab === "myProducts") {
      if (products.length === 0) return <p>Henüz ürün yok.</p>;
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px", backgroundColor: "#f9fafb" }}>
            <thead style={{ backgroundColor: "#e5e7eb" }}>
              <tr>
                <th style={thStyle}>Ürün Adı</th>
                <th style={thStyle}>Fiyat (ETH)</th>
                <th style={thStyle}>Durum</th>
                <th style={thStyle}>Nakliye Başvuruları</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.price}</td>
                  <td style={tdStyle}>{["Oluşturuldu", "Satıldı", "Yolda", "Ulaştı", "Teslim Edildi"][p.status]}</td>
                  <td style={tdStyle}>
                    {p.status === 1 ? (
                      requests[p.id]?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {requests[p.id].map((addr) => (
                            <div key={addr} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span style={{ fontSize: "13px" }}>{addr}</span>
                              <button onClick={() => acceptRequest(p.id, addr)} style={btnStyleAccept}>Kabul</button>
                              <button onClick={() => rejectRequest(p.id, addr)} style={btnStyleReject}>Reddet</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "#6b7280" }}>Başvuru yok</span>
                      )
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div style={{ flex: 1, padding: "30px", overflowY: "auto", backgroundColor: "#f8fafc", width: "100%" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px", color: "#0f172a" }}>
          {selectedTab === "create" ? "Ürün Oluştur" : "Ürünlerim"}
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default ProducerDashboard;
