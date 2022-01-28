// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract NameRegistry {
    event Registered(address _user, bytes32 _name, uint _expiry_block);
    event Renewed(address _user, bytes32 _name, uint _expiry_block);
    event Canceled(address _user, bytes32 _name, uint _expiry_block, uint _renewed_blocks);

    struct NameEntry {
        bytes32 name;
        uint expires_at;
        address owner;
    }

    mapping(address => NameEntry[]) public user_reservations;
    mapping(bytes32 => NameEntry) public name_entries;

    function getNameInfo(bytes32 name) public view returns (address, bytes32, uint) {
        bytes32 name_hash = keccak256(abi.encode(name));

        NameEntry memory nameObj = name_entries[name_hash];
        return (nameObj.owner, nameObj.name, nameObj.expires_at);
    }

    function register(bytes32 name, uint expires_after) public payable {
        require(msg.sender != address(0));
        require(expires_after != 0);

        bytes32 name_hash = keccak256(abi.encode(name));
        NameEntry storage name_entry = name_entries[name_hash];

        uint old_expires = name_entry.expires_at;

        assert(name_entry.owner == address(0) || old_expires < block.number);

        uint new_expires = block.number + expires_after;
        assert(new_expires - block.number == expires_after);

        // TODO: pay bid
        //        uint memory bid = expires_after * 1;
        //        assert_has_enough_balance(msg.sender, bid);
        //        (bool sent, bytes memory data) = _to.call{value: bid}("");

        if (!name_entry_was_reserved_by_user(msg.sender, name_entry)) {
            user_reservations[msg.sender].push(name_entry);
        }

        name_entry.name = name;
        name_entry.expires_at = new_expires;
        name_entry.owner = msg.sender;

        name_entries[name_hash] = name_entry;

        emit Registered(msg.sender, name, new_expires);
    }

    function name_entry_was_reserved_by_user(address user, NameEntry memory name_entry) private view returns (bool) {
        if (name_entry.owner == user) {
            return true;
        }

        if (name_entry.expires_at == 0) {
            return false;
        }

        for (uint i=0; i < user_reservations[user].length; i++) {
            if (user_reservations[user][i].name == name_entry.name) {
                return true;
            }
        }

        return false;
    }

    function renew(bytes32 name, uint expires_after) public payable {
        require(msg.sender != address(0));
        require(expires_after != 0);

        bytes32 name_hash = keccak256(abi.encode(name));

        NameEntry storage name_entry = name_entries[name_hash];
        uint old_expires = name_entry.expires_at;

        assert(name_entry.owner == msg.sender && old_expires > block.number);

        uint new_expires = old_expires + expires_after;
        assert(new_expires - old_expires == expires_after);

        name_entry.expires_at = new_expires;

        emit Renewed(msg.sender, name, new_expires);
    }

    function cancel(bytes32 name) public payable {
        require(msg.sender != address(0));

        bytes32 name_hash = keccak256(abi.encode(name));

        NameEntry storage name_entry = name_entries[name_hash];
        uint old_expires = name_entry.expires_at;

        assert(name_entry.owner == msg.sender && old_expires > block.number);

        uint refunded_blocks = old_expires - block.number;

        name_entry.expires_at = block.number;

        emit Canceled(msg.sender, name, name_entry.expires_at, refunded_blocks);
    }
}
