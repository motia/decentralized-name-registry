pragma solidity >=0.4.21 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./NameRegistry.sol";

contract NameToken is ERC20, ERC20Detailed {
    constructor() public ERC20Detailed("Nabet", "NBT", 0) {
        _mint(_msgSender(), 2000000000);
    }
}
