// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RolesManager.sol";
import "./ProductManager.sol";

contract ShippingManager {
    mapping(uint => address[]) private shippingRequests;

    RolesManager public rolesManager;
    ProductManager public productManager;

    event ShippingRequested(uint indexed productId, address indexed shipper);
    event TransportConfirmed(uint indexed productId, address indexed shipper);

    constructor(address _rolesManagerAddress, address _productManagerAddress) {
        rolesManager = RolesManager(_rolesManagerAddress);
        productManager = ProductManager(_productManagerAddress);
    }

    function requestShipping(uint productId) external {
        require(rolesManager.hasRole(msg.sender, RolesManager.Role.Shipper), "Only shipper can apply");

        (address currentShipper, uint8 status) = productManager.getShippingInfo(productId);
        require(currentShipper == address(0), "Already assigned");
        require(status == 1, "Product not suitable"); // 1: Sold

        address[] storage requests = shippingRequests[productId];
        for (uint i = 0; i < requests.length; i++) {
            require(requests[i] != msg.sender, "Already applied");
        }

        requests.push(msg.sender);
        emit ShippingRequested(productId, msg.sender);
    }

    function getShippingRequests(uint productId) external view returns (address[] memory) {
        return shippingRequests[productId];
    }

    function confirmTransport(uint productId) external {
        (address currentShipper, uint8 status) = productManager.getShippingInfo(productId);

        require(currentShipper == msg.sender, "Only assigned shipper can confirm");
        require(status == 2, "Product must be shipped"); // 2: Shipped

        productManager.confirmShippingDelivery(productId, msg.sender);

        emit TransportConfirmed(productId, msg.sender);
    }

    function getAssignedProducts(address shipper) external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < productManager.nextProductId(); i++) {
            (address assignedShipper, ) = productManager.getShippingInfo(i);
            if (assignedShipper == shipper) {
                count++;
            }
        }
        uint[] memory assigned = new uint[](count);
        uint j = 0;
        for (uint i = 0; i < productManager.nextProductId(); i++) {
            (address assignedShipper, ) = productManager.getShippingInfo(i);
            if (assignedShipper == shipper) {
                assigned[j] = i;
                j++;
            }
        }
        return assigned;
    }

    function getShippingStatus(uint productId) external view returns (uint8) {
        (, uint8 status) = productManager.getShippingInfo(productId);
        return status;
    }
}
