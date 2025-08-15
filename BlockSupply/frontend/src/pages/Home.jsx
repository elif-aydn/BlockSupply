import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../contexts/WalletContext";
import { ActiveRoleContext } from "../contexts/ActiveRoleContext";
import { RolesManagerABI } from "../utils/contractAbis";
import { ROLES_MANAGER_ADDRESS } from "../utils/contractAddress";
import { ethers } from "ethers";

const Home = () => {
  const { connectWallet, account, signer } = useContext(WalletContext);
  const { setActiveRole } = useContext(ActiveRoleContext);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const rolesContract = useMemo(() => {
    return signer
      ? new ethers.Contract(ROLES_MANAGER_ADDRESS, RolesManagerABI, signer)
      : null;
  }, [signer]);

  const roleEnum = useMemo(() => {
    const map = { Producer: 0, Shipper: 1, Buyer: 2 };
    return map[selectedRole];
  }, [selectedRole]);

  const handleLogin = async () => {
    if (!account || !signer) return alert("Önce Metamask ile bağlanın.");
    if (!selectedRole) return alert("Lütfen bir rol seçin.");
    if (!rolesContract) return alert("Sözleşme bağlantısı başarısız.");

    setLoading(true);

    try {
      const already = await rolesContract.hasRole(account, roleEnum);
      if (!already) {
        const fnMap = {
          Producer: "registerAsProducer",
          Shipper: "registerAsShipper",
          Buyer: "registerAsBuyer",
        };
        const fn = fnMap[selectedRole];
        const tx = await rolesContract[fn]();
        await tx.wait();
      }

      setActiveRole(selectedRole);
      localStorage.setItem("activeRole", selectedRole);
      navigate(`/${selectedRole.toLowerCase()}`);
    } catch (err) {
      const msg = err.reason || err.data?.message || err.message;
      if (msg && msg.includes("already registered")) {
        setActiveRole(selectedRole);
        localStorage.setItem("activeRole", selectedRole);
        navigate(`/${selectedRole.toLowerCase()}`);
      } else {
        alert("Kayıt hatası: " + msg);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "40px",
          borderRadius: "16px",
          backgroundColor: "#fff",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "480px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "8px",
            color: "#111827",
            textAlign: "center",
          }}
        >
          BlockSupply'e Hoş Geldiniz
        </h1>
        <p
          style={{
            fontWeight: 500,
            fontSize: "15px",
            marginBottom: "24px",
            color: "#4b5563",
            textAlign: "center",
          }}
        >
          Lütfen Metamask cüzdanınızı bağlayın
        </p>

        {!account ? (
          <button
            onClick={connectWallet}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            Metamask ile Bağlan
          </button>
        ) : (
          <p
            style={{
              fontSize: "14px",
              color: "#111827",
              wordBreak: "break-word",
              textAlign: "center",
            }}
          >
            Bağlı Cüzdan: <strong>{account}</strong>
          </p>
        )}

        {account && (
          <div style={{ marginTop: 32 }}>
            <p
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#374151",
                textAlign: "center",
              }}
            >
              Rol Seçimi
            </p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: "10px 12px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                backgroundColor: "#f9fafb",
                color: "#111827",
                textAlignLast: "center", // <== select içeriği ortalanır
              }}
            >
              <option value="">Bir rol seçin</option>
              <option value="Producer">Üretici</option>
              <option value="Shipper">Nakliyeci</option>
              <option value="Buyer">Tüketici</option>
            </select>
            <button
              onClick={handleLogin}
              disabled={loading || !selectedRole}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px 0",
                fontSize: "16px",
                backgroundColor:
                  loading || !selectedRole ? "#9ca3af" : "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "0.3s",
              }}
            >
              {loading ? "Yükleniyor…" : "Giriş Yap"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
