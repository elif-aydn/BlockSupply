// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./RolesManager.sol";

contract ProductManager {
    enum Status { Created, Sold, Shipped, Arrived, Delivered } // ürünün durumunu belirtir.

    struct Product {
        uint id;
        string name;
        uint price;
        address producer;
        address buyer;
        address shipper;
        Status status;
    }

    mapping(uint => Product) public products;
    uint public nextProductId;
    RolesManager public rolesManager;

    event ProductCreated(uint indexed id, address indexed producer, string name, uint price);
    event ProductPurchased(uint indexed id, address indexed buyer);
    event ShipperAssigned(uint indexed id, address indexed shipper);
    event ShippingArrived(uint indexed id, address indexed shipper);
    event DeliveryConfirmed(uint indexed id, address indexed buyer);

    constructor(address _rolesManagerAddress) {
        rolesManager = RolesManager(_rolesManagerAddress);
    }


    function createProduct(string memory _name, uint _price) external {
        require(
            rolesManager.hasRole(msg.sender, RolesManager.Role.Producer),
            "Only producer can create product"
        );
        products[nextProductId] = Product({
            id: nextProductId,
            name: _name,
            price: _price,
            producer: msg.sender,
            buyer: address(0),
            shipper: address(0),
            status: Status.Created
        });
        emit ProductCreated(nextProductId, msg.sender, _name, _price);
        nextProductId++;
    }

    function getProduct(uint _id) external view returns (Product memory) {
        return products[_id];
    }

    function buyProduct(uint _id) external payable {
        Product storage p = products[_id];
        require(rolesManager.hasRole(msg.sender, RolesManager.Role.Buyer), "Only consumer can purchase");
        require(p.status == Status.Created, "The product cannot be purchased");
        require(msg.value == p.price, "Wrong value sent");
        require(p.buyer == address(0), "This product has already been purchased");
        p.buyer = msg.sender;
        p.status = Status.Sold;
        emit ProductPurchased(_id, msg.sender);
        payable(p.producer).transfer(msg.value);
    }

    function assignShipper(uint _id, address _shipper) external {
        Product storage p = products[_id];
        require(rolesManager.hasRole(msg.sender, RolesManager.Role.Producer), "Only the manufacturer can appoint");
        require(p.producer == msg.sender, "Can only appoint a carrier for his/her own product");
        require(rolesManager.hasRole(_shipper, RolesManager.Role.Shipper), "The address to be assigned is not the carrier");
        require(p.status == Status.Sold, "Product must be purchased");
        p.shipper = _shipper;
        p.status = Status.Shipped;
        emit ShipperAssigned(_id, _shipper);
    }

    function confirmShippingDelivery(uint _id, address _shipper) external {
        Product storage p = products[_id];
        require(p.shipper == _shipper, "Only the designated carrier can confirm delivery");
        require(p.status == Status.Shipped, "Product must be shipped");
        p.status = Status.Arrived;
        emit ShippingArrived(_id, _shipper);
    }

    function confirmDelivery(uint _id) external {
        Product storage p = products[_id];
        require(rolesManager.hasRole(msg.sender, RolesManager.Role.Buyer), "Only the consumer can approve");
        require(p.buyer == msg.sender, "Only the buyer can confirm delivery");
        require(p.status == Status.Arrived, "");
        p.status = Status.Delivered;
        emit DeliveryConfirmed(_id, msg.sender);
    }

    function getProductsByOwner(address _owner) external view returns (Product[] memory) {
        uint count = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].producer == _owner || products[i].buyer == _owner) {
                count++;
            }
        }
        Product[] memory result = new Product[](count);
        uint j = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].producer == _owner || products[i].buyer == _owner) {
                result[j] = products[i];
                j++;
            }
        }
        return result;
    }

    function getAvailableProducts() external view returns (Product[] memory) {
        uint count = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].status == Status.Created) {
                count++;
            }
        }
        Product[] memory result = new Product[](count);
        uint j = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].status == Status.Created) {
                result[j] = products[i];
                j++;
            }
        }
        return result;
    }

    // --- Enum tipi uint8 olarak döndürülüyor ---
    function getShippingInfo(uint _id) external view returns (address, uint8) {
        Product storage p = products[_id];
        return (p.shipper, uint8(p.status));
    }

    /// Satılmış ve shipper atanmamış ürünler
    function getSoldProducts() external view returns (Product[] memory) {
        uint count;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].status == Status.Sold && products[i].shipper == address(0)) {
                count++;
            }
        }
        Product[] memory list = new Product[](count);
        uint j;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].status == Status.Sold && products[i].shipper == address(0)) {
                list[j++] = products[i];
            }
        }
        return list;
    }

    /// Bu adresli shipper’a atanmış ürünler
    function getShipmentsByShipper(address _shipper) external view returns (Product[] memory) {
        uint count;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].shipper == _shipper) {
                count++;
            }
        }
        Product[] memory list = new Product[](count);
        uint j;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].shipper == _shipper) {
                list[j++] = products[i];
            }
        }
        return list;
    }

    function getProductsByProducer(address _producer) external view returns (Product[] memory) {
        uint count = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].producer == _producer) {
                count++;
            }
        }
        Product[] memory result = new Product[](count);
        uint j = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].producer == _producer) {
                result[j] = products[i];
                j++;
            }
        }
        return result;
    }

    /// Sadece buyer’a ait ürünler (siparişler)
    function getProductsByBuyer(address _buyer) external view returns (Product[] memory) {
        uint count = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].buyer == _buyer) {
                count++;
            }
        }
        Product[] memory result = new Product[](count);
        uint j = 0;
        for (uint i = 0; i < nextProductId; i++) {
            if (products[i].buyer == _buyer) {
                result[j] = products[i];
                j++;
            }
        }
        return result;
    }
}
