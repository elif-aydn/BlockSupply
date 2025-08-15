import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { ActiveRoleProvider, ActiveRoleContext } from "./contexts/ActiveRoleContext";
import Home from "./pages/Home";
import ProducerDashboard from "./pages/ProducerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import ShipperDashboard from "./pages/ShipperDashboard";
import React, { useEffect, useContext } from 'react';

function RequireRole({ role, children }) {
  const { activeRole } = useContext(ActiveRoleContext);
  return activeRole === role ? children : <Navigate to="/" />;
}

// 🟢 Açılışta localStorage’dan role okuma ve yönlendirme
function RedirectOnLoad() {
  const navigate = useNavigate();
  const { setActiveRole } = useContext(ActiveRoleContext);

  useEffect(() => {
    const savedRole = localStorage.getItem("activeRole");
    if (savedRole) {
      setActiveRole(savedRole);
      navigate(`/${savedRole.toLowerCase()}`);
    }
  }, [navigate, setActiveRole]);

  return null;
}

function App() {
  return (
    <WalletProvider>
      <ActiveRoleProvider>
        <Router>
          <RedirectOnLoad />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/producer"
              element={
                <RequireRole role="Producer">
                  <ProducerDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/shipper"
              element={
                <RequireRole role="Shipper">
                  <ShipperDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/buyer"
              element={
                <RequireRole role="Buyer">
                  <BuyerDashboard />
                </RequireRole>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ActiveRoleProvider>
    </WalletProvider>
  );
}

export default App;
