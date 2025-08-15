import React, { useState, useEffect, useContext, useMemo } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { WalletContext } from "../contexts/WalletContext";
import { ActiveRoleContext } from "../contexts/ActiveRoleContext";
import { PRODUCT_MANAGER_ADDRESS, SHIPPING_MANAGER_ADDRESS } from "../utils/contractAddress";
import { ProductManagerABI, ShippingManagerABI } from "../utils/contractAbis";
import ProductCard from "../components/ProductCard";
import Sidebar from "../components/Sidebar";

const ShipperDashboard = () => {
  const { signer, account } = useContext(WalletContext);
  const { activeRole } = useContext(ActiveRoleContext);

  const [selectedTab, setSelectedTab] = useState("toOffer");
  const [toOffer, setToOffer] = useState([]);
  const [pending, setPending] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [requestedProductIds, setRequestedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  if (activeRole !== "Shipper") {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Bu sayfaya erişim izniniz yok. Lütfen nakliyeci olarak giriş yapın.
      </p>
    );
  }

  const productContract = useMemo(() => signer && new ethers.Contract(PRODUCT_MANAGER_ADDRESS, ProductManagerABI, signer), [signer]);
  const shippingContract = useMemo(() => signer && new ethers.Contract(SHIPPING_MANAGER_ADDRESS, ShippingManagerABI, signer), [signer]);

  const fetchData = async () => {
    if (!productContract || !shippingContract || !account) return;
    setLoading(true);
    try {
      const rawSold = await productContract.getSoldProducts();
      const sold = rawSold.map(p => ({
        id: Number(p.id),
        name: p.name,
        priceEth: ethers.formatEther(p.price),
        status: Number(p.status),
      }));
      const offerables = sold.filter(p => p.status === 1);

      const pendingArr = [];
      const rejectedArr = [];
      const appliedIds = new Set();

      for (const p of offerables) {
        const requests = await shippingContract.getShippingRequests(p.id);
        const full = await productContract.getProduct(p.id);
        const shipperAddr = full.shipper;
        const hasRequested = requests.map(x => x.toLowerCase()).includes(account.toLowerCase());

        if (hasRequested) {
          appliedIds.add(p.id);
          if (shipperAddr === ethers.ZeroAddress) pendingArr.push(p);
          else if (shipperAddr.toLowerCase() !== account.toLowerCase()) rejectedArr.push(p);
        }
      }

      const availableToOffer = offerables.filter(p => !appliedIds.has(p.id));
      const rawAssigned = await productContract.getShipmentsByShipper(account);
      const assignedArr = rawAssigned.map(p => ({
        id: Number(p.id),
        name: p.name,
        priceEth: ethers.formatEther(p.price),
        status: Number(p.status),
      }));

      setRequestedProductIds(appliedIds);
      setToOffer(availableToOffer);
      setPending(pendingArr);
      setRejected(rejectedArr);
      setAssigned(assignedArr);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      Swal.fire({ icon: "error", title: "Veriler alınamadı", text: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [productContract, shippingContract, account]);

  const handleRequestShipping = async (productId) => {
    if (!shippingContract || !productContract) return;
    try {
      const tx = await shippingContract.requestShipping(productId);
      setRequestedProductIds(prev => new Set([...prev, productId]));
      await tx.wait();
      Swal.fire({ icon: "success", title: "Talep gönderildi", timer: 2000, showConfirmButton: false });
      fetchData();
    } catch (err) {
      const reason = err.reason || err.data?.message || "Talep gönderilemedi.";
      Swal.fire({ icon: "error", title: reason });
      fetchData();
    }
  };

  const handleConfirmTransport = async (productId) => {
    if (!shippingContract) return;
    try {
      const tx = await shippingContract.confirmTransport(productId);
      await tx.wait();
      Swal.fire({ icon: "success", title: "Kargo varış onaylandı", timer: 2000, showConfirmButton: false });
      fetchData();
    } catch (err) {
      Swal.fire({ icon: "error", title: err.reason || "Onaylanamadı" });
    }
  };

  const renderContent = () => {
    if (loading) return <p>Yükleniyor...</p>;

    let list = [];
    switch (selectedTab) {
      case "toOffer": list = toOffer; break;
      case "pending": list = pending; break;
      case "assigned": list = assigned; break;
      case "rejected": list = rejected; break;
      default: list = []; break;
    }

    if (list.length === 0) {
      return <p>Bu sekmede gösterilecek ürün yok.</p>;
    }

    return list.map(p => (
      <div key={p.id} style={{ marginBottom: "20px" }}>
        <ProductCard product={p} showStatus={
          selectedTab === "pending" ? "Bekleniyor" :
          selectedTab === "assigned" ? (p.status === 2 ? "Yolda" : "Varış Onaylandı") :
          selectedTab === "rejected" ? "Reddedildi" : undefined
        } />
        {selectedTab === "toOffer" && (
          <button
            onClick={() => handleRequestShipping(p.id)}
            disabled={requestedProductIds.has(p.id)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              marginTop: "10px",
              cursor: requestedProductIds.has(p.id) ? "not-allowed" : "pointer"
            }}
          >
            {requestedProductIds.has(p.id) ? "Nakliye Talebi Gönderildi" : "Nakliye Talebi Gönder"}
          </button>
        )}
        {selectedTab === "assigned" && p.status === 2 && (
          <button
            onClick={() => handleConfirmTransport(p.id)}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Varış Onayla
          </button>
        )}
      </div>
    ));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Sidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        role="Shipper"
        tabs={[
          { label: "Teklif Verilebilecek Ürünler", key: "toOffer" },
          { label: "Bekleyen Nakliye Talepleri", key: "pending" },
          { label: "Kabul Edilen Nakliyeler", key: "assigned" },
          { label: "Reddedilen Talepler", key: "rejected" },
        ]}
      />
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px", color: "#0f172a" }}>
          {selectedTab === "toOffer" ? "Teklif Verilebilecek Ürünler" :
           selectedTab === "pending" ? "Bekleyen Nakliye Talepleri" :
           selectedTab === "assigned" ? "Kabul Edilen Nakliyeler" :
           "Reddedilen Talepler"}
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default ShipperDashboard;
