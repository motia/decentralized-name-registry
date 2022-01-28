// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract NameRegistry {
    using SafeMath for uint;

    uint constant fee_per_block = 10;

    event Registered(address _user, bytes32 _name, uint _expiry_block);
    event Renewed(address _user, bytes32 _name, uint _expiry_block);
    event Canceled(address _user, bytes32 _name, uint _expiry_block, uint _renewed_blocks);

    IERC20 token;

    constructor (IERC20 _token) public {
        token = _token;
    }

    struct NameEntry {
        bytes32 name;
        uint expires_at;
        address owner;
    }

    mapping(address => bytes32[]) public user_reservations;
    mapping(bytes32 => NameEntry) public name_entries;

    function fetchUserRegisteredNames()
    public
    view
    returns (NameEntry[] memory)
    {
        NameEntry[] memory items = new NameEntry[](user_reservations[msg.sender].length);
        for (uint i = 0; i < user_reservations[msg.sender].length; i++) {
            items[i] = name_entries[user_reservations[msg.sender][i]];
        }
        return items;
    }


    function getNameInfo(bytes32 name) public view returns (address, bytes32, uint) {
        bytes32 name_hash = keccak256(abi.encode(name));

        NameEntry memory nameObj = name_entries[name_hash];
        return (nameObj.owner, nameObj.name, nameObj.expires_at);
    }

    function register(bytes32 name, uint expires_after) public payable {
        require(expires_after != 0, 'expires_after is zero');

        bytes32 name_hash = keccak256(abi.encode(name));
        NameEntry storage name_entry = name_entries[name_hash];

        uint old_expires = name_entry.expires_at;

        assert(old_expires < block.number);

        uint new_expires = block.number.add(expires_after);

        uint fee = expires_after.mul(fee_per_block);
        require(token.transferFrom(msg.sender, address(this), fee), 'no enough tokens for transaction');

        name_entry.name = name;
        name_entry.expires_at = new_expires;
        name_entry.owner = msg.sender;

        name_entries[name_hash] = name_entry;

        if (!name_entry_was_reserved_by_user(msg.sender, name_hash)) {
            user_reservations[msg.sender].push(name_hash);
        }

        emit Registered(msg.sender, name, new_expires);
    }

    function name_entry_was_reserved_by_user(address user, bytes32 name_hash) private view returns (bool) {
        for (uint i = 0; i < user_reservations[user].length; i++) {
            if (user_reservations[user][i] == name_hash) {
                return true;
            }
        }

        return false;
    }

    function renew(bytes32 name, uint expires_after) public payable {
        require(expires_after != 0);

        bytes32 name_hash = keccak256(abi.encode(name));

        NameEntry storage name_entry = name_entries[name_hash];
        uint old_expires = name_entry.expires_at;

        assert(name_entry.owner == msg.sender && old_expires > block.number);

        uint new_expires = old_expires.add(expires_after);

        uint fee = expires_after.mul(fee_per_block);
        require(token.transferFrom(msg.sender, address(this), fee), 'no enough tokens for transaction');
        name_entry.expires_at = new_expires;

        emit Renewed(msg.sender, name, new_expires);
    }

    function cancel(bytes32 name) public payable {
        bytes32 name_hash = keccak256(abi.encode(name));

        NameEntry storage name_entry = name_entries[name_hash];
        uint old_expires = name_entry.expires_at;

        assert(name_entry.owner == msg.sender);
//        require(old_expires > block.number, "Name entry already expired");

        uint refunded_blocks = old_expires.sub(block.number);
        token.transfer(msg.sender, refunded_blocks.mul(fee_per_block));

        name_entry.expires_at = block.number;

        emit Canceled(msg.sender, name, name_entry.expires_at, refunded_blocks);
    }
}
