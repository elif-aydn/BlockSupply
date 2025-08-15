// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title RolesManager - Role management contract
contract RolesManager {
    enum Role { Producer, Shipper, Buyer }

    mapping(address => mapping(Role => bool)) private roles;

    function registerAsProducer() external {
        require(!roles[msg.sender][Role.Producer], "The address is already registered as a manufacturer");
        roles[msg.sender][Role.Producer] = true;
    }

    function registerAsShipper() external {
        require(!roles[msg.sender][Role.Shipper], "The address is already registered as a carrier");
        roles[msg.sender][Role.Shipper] = true;
    }

    function registerAsBuyer() external {
        require(!roles[msg.sender][Role.Buyer], "Address already registered as consumer");
        roles[msg.sender][Role.Buyer] = true;
    }

    function hasRole(address user, Role role) public view returns (bool) {
        return roles[user][role];
    }

    /// Kullanıcının sahip olduğu ilk rolü döner (0=Producer, 1=Shipper, 2=Buyer). Hiçbiri yoksa 255 döner.
    function getRole(address user) external view returns (uint8) {
        if (roles[user][Role.Producer]) return uint8(Role.Producer); // 0
        if (roles[user][Role.Shipper]) return uint8(Role.Shipper);   // 1
        if (roles[user][Role.Buyer]) return uint8(Role.Buyer);       // 2
        return 255; // Rol yoksa
    }

    modifier onlyProducer() {
        require(roles[msg.sender][Role.Producer], "Only producer can create product");
        _;
    }

    modifier onlyShipper() {
        require(roles[msg.sender][Role.Shipper], "Only shipper can apply");
        _;
    }

    modifier onlyBuyer() {
        require(roles[msg.sender][Role.Buyer], "Only buyer can confirm");
        _;
    }
}
