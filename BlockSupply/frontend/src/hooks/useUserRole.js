// src/hooks/useUserRole.js

import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { WalletContext } from "../contexts/WalletContext";

import { ROLES_MANAGER_ADDRESS } from "../utils/contractAddress";
import { RolesManagerABI } from "../utils/contractAbis";

const ROLE_MAP = {
  1: "producer",
  2: "shipper",
  3: "buyer",
  0: "none",
};

const useUserRole = () => {
  const { account, signer } = useContext(WalletContext);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!signer || !account) return;

      try {
        setLoading(true);
        const contract = new ethers.Contract(ROLES_MANAGER_ADDRESS, RolesManagerABI, signer);
        const roleIndex = await contract.getRole(account);
        setRole(ROLE_MAP[Number(roleIndex)] || "unknown");
      } catch (error) {
        console.error("Rol çekilirken hata:", error);
        setRole("error");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [signer, account]);

  return { role, loading };
};

export default useUserRole;
