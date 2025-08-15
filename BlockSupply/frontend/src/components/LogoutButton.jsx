import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveRoleContext } from "../contexts/ActiveRoleContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { setActiveRole } = useContext(ActiveRoleContext);

  const handleLogout = () => {
    localStorage.removeItem("activeRole");
    setActiveRole(null);
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 16px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      Çıkış Yap
    </button>
  );
};

export default LogoutButton;
