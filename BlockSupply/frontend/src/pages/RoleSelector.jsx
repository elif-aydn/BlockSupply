import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletContext } from "../contexts/WalletContext";
import { RolesManagerABI } from "../utils/contractAbis";
import { ROLES_MANAGER_ADDRESS } from "../utils/contractAddress";
import { ethers } from "ethers";

const Home = () => {
  const { connectWallet, account, signer } = useContext(WalletContext);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!account || !signer) return alert("Lütfen Metamask ile bağlanın.");
    if (!selectedRole) return alert("Lütfen bir rol seçin.");

    try {
      setLoading(true);
      const contract = new ethers.Contract(
        ROLES_MANAGER_ADDRESS,
        RolesManagerABI,
        signer
      );

      let tx;
      if (selectedRole === "Producer") tx = await contract.registerProducer();
      else if (selectedRole === "Buyer") tx = await contract.registerBuyer();
      else if (selectedRole === "Shipper") tx = await contract.registerShipper();

      await tx.wait();
      alert(`${selectedRole} olarak başarıyla kayıt oldunuz!`);

      // Role göre yönlendirme
      if (selectedRole === "Producer") navigate("/producer");
      else if (selectedRole === "Buyer") navigate("/buyer");
      else if (selectedRole === "Shipper") navigate("/shipper");
    } catch (err) {
      console.error(err);
      alert("Kayıt başarısız: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>BlockSupply'e Hoş Geldin</h1>
      {!account && <button onClick={connectWallet}>Metamask ile Bağlan</button>}
      {account && <p>Bağlı Cüzdan: {account}</p>}

      <div style={{ marginTop: "20px" }}>
        <h3>Rol Seçimi</h3>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Bir rol seçin</option>
          <option value="Producer">Üretici</option>
          <option value="Buyer">Tüketici</option>
          <option value="Shipper">Nakliyeci</option>
        </select>
        <br />
        <button onClick={handleRegister} disabled={loading || !selectedRole}>
          {loading ? "Kayıt ediliyor..." : "Kayıt Ol"}
        </button>
      </div>
    </div>
  );
};

export default Home;
