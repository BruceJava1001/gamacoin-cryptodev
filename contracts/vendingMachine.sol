//SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.0 <0.9.0;

import "./token.sol";

// import "hardhat/console.sol";

contract VendingMachine {
    //Properties
    address private admin;
    address public tokenAddress;
    uint256 private buyingprice;
    uint256 private sellingprice;

    // Modifiers
    modifier isAdmin() {
        require(msg.sender == admin, "Must be the admin");
        _;
    }

    constructor(address token) {
        admin = msg.sender;
        tokenAddress = token;
        buyingprice = 2 ether;
        sellingprice = 1 ether;
    }

    function availableSupply() public view returns (uint256) {
        return (GamaToken(tokenAddress).balanceOf(address(this)));
    }

    function buyingPrice() public view returns (uint256) {
        return (buyingprice);
    }

    function sellingPrice() public view returns (uint256) {
        return (sellingprice);
    }

    function buyTokens(uint256 amount) public payable {
        require(amount > 0, "Amount has to be greater than 0");
        require(
            msg.value >= amount * buyingprice,
            "The trasaction value was lower than expected"
        );
        require(availableSupply() >= amount, "Not enough tokens in stock");
        GamaToken(tokenAddress).transferFrom(address(this), msg.sender, amount);
    }

    function sellTokens(uint256 amount) public {
        require(amount > 0, "Amount has to be greater than 0");
        require(
            address(this).balance >= amount * sellingprice,
            "The machine does not have enough Ether"
        );
        GamaToken(tokenAddress).transferFrom(msg.sender, address(this), amount);
        address payable payTo = payable(msg.sender);
        payTo.transfer(amount * sellingprice);
    }

    function withdrawEthers() public isAdmin returns (bool) {
        address payable payTo = payable(msg.sender);
        payTo.transfer(address(this).balance);
        return (true);
    }

    function changeSellPrice(uint256 price) public isAdmin returns (uint256) {
        require(price > 0, "The price can not be 0");
        require(price != sellingprice, "The price has to be different");
        require(
            price <= buyingprice,
            "The selling price can not be greater than the buying price"
        );
        sellingprice = price;
        return (sellingprice);
    }

    function changeBuyPrice(uint256 price) public isAdmin returns (uint256) {
        require(price > 0, "The price can not be 0");
        require(price != buyingprice, "The price has to be different");
        require(
            price >= sellingprice,
            "The buying price can not be less than the selling price"
        );
        buyingprice = price;
        return (buyingprice);
    }

    function kill() public isAdmin {
        GamaToken(tokenAddress).transferFrom(
            address(this),
            msg.sender,
            GamaToken(tokenAddress).balanceOf(address(this))
        );
        selfdestruct(payable(msg.sender));
    }
}
