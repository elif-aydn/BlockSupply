import { useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { WalletContext } from "../contexts/WalletContext";
import { ROLES_MANAGER_ADDRESS, PRODUCT_MANAGER_ADDRESS } from "../utils/contractAddress";
import { RolesManagerABI, ProductManagerABI } from "../utils/contractAbis";

export default function useContract() {
  const { signer } = useContext(WalletContext);
  const [rolesManager, setRolesManager] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!signer) return;
    setRolesManager(new ethers.Contract(
      ROLES_MANAGER_ADDRESS,
      RolesManagerABI,
      signer
    ));
    setProduct(new ethers.Contract(
      PRODUCT_MANAGER_ADDRESS,
      ProductManagerABI,
      signer
    ));
  }, [signer]);

  return { rolesManager, product };
}
