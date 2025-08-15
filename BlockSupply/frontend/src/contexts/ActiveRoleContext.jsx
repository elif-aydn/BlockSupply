import React, { createContext, useState, useEffect } from "react";

export const ActiveRoleContext = createContext();

export const ActiveRoleProvider = ({ children }) => {
  const [activeRole, _setActiveRole] = useState("");

  // Sayfa yenilenince localStorage’dan geri yükle
  useEffect(() => {
    const stored = localStorage.getItem("activeRole");
    if (stored) _setActiveRole(stored);
  }, []);

  const setActiveRole = (role) => {
    if (role) {
      localStorage.setItem("activeRole", role);
    } else {
      localStorage.removeItem("activeRole");
    }
    _setActiveRole(role);
  };

  const clearRole = () => {
    localStorage.removeItem("activeRole");
    _setActiveRole("");
  };

  return (
    <ActiveRoleContext.Provider value={{ activeRole, setActiveRole, clearRole }}>
      {children}
    </ActiveRoleContext.Provider>
  );
};
