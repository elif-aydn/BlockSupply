import { createContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (!window.ethereum) {
      console.warn("Metamask yüklü değil!");
      return;
    }

    const _provider = new BrowserProvider(window.ethereum);
    setProvider(_provider);

    // Daha önce bağlanmış hesap varsa otomatik tanı
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const _signer = await _provider.getSigner();
          setSigner(_signer);
        }
      })
      .catch(console.error);

    // 🔴 Önemli: hesap değişince signer'ı da güncelle
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const _signer = await _provider.getSigner();
        setSigner(_signer);

        // İsteğe bağlı ama tavsiye: rolü sıfırla, Home'a dön
        localStorage.removeItem("activeRole");
        // Role guard'lar karışmasın diye ana sayfaya al
        window.location.assign("/");
      } else {
        setAccount(null);
        setSigner(null);
        localStorage.removeItem("activeRole");
        window.location.assign("/");
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // Kullanıcı manuel bağlanmak istediğinde
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Metamask yüklü değil!");
      return;
    }
    try {
      const _provider = new BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const _signer = await _provider.getSigner();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Cüzdan bağlanma hatası:", err);
    }
  };

  return (
    <WalletContext.Provider value={{ account, provider, signer, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

