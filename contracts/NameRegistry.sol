// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract NameRegistry {
    event Registered(address _user, bytes32 _name, uint _expiry_block);
    event Renewed(address _user, bytes32 _name, uint _expiry_block);
    event Canceled(address _user, bytes32 _name, uint _expiry_block);

    struct Name {
        bytes32 name;
        uint expires_at;
    }

    mapping(address => mapping(bytes32 => Name)) public user_name_reservations;
    mapping(bytes32 => address) public name_current_owners;

    function getNameInfo(bytes32 name) public view returns (address, bytes32, uint) {
        bytes32 name_hash = keccak256(abi.encode(name));

        address owner = name_current_owners[name_hash];
        Name memory nameObj = user_name_reservations[owner][name_hash];
        return (owner, nameObj.name, nameObj.expires_at);
    }

    function register(bytes32 name, uint expires_after) public payable {
        require(msg.sender != address(0));
        require(expires_after != 0);

        bytes32 name_hash = keccak256(abi.encode(name));
        address old_owner = name_current_owners[name_hash];
        uint old_expires = user_name_reservations[old_owner][name_hash].expires_at;

        assert(old_owner == address(0) || old_expires < block.number);

        uint new_expires = block.number + expires_after;
        assert(new_expires - block.number == expires_after);

        // TODO: pay bid
        //        uint memory bid = expires_after * 1;
        //        assert_has_enough_balance(msg.sender, bid);
        //        (bool sent, bytes memory data) = _to.call{value: bid}("");

        if (old_owner != address (0)) {
            delete user_name_reservations[old_owner][name_hash];
        }
        user_name_reservations[msg.sender][name_hash] = Name(name, new_expires);
        name_current_owners[name_hash] = msg.sender;

        emit Registered(msg.sender, name, new_expires);
    }

    function renew(bytes32 name, uint expires_after) public payable {
        require(msg.sender != address(0));
        require(expires_after != 0);

        bytes32 name_hash = keccak256(abi.encode(name));


        address old_owner = name_current_owners[name_hash];
        uint old_expires = user_name_reservations[old_owner][name_hash].expires_at;

        assert(old_owner == msg.sender && old_expires >= block.number);

        uint new_expires = old_expires + expires_after;
        assert(new_expires - old_expires == expires_after);

        user_name_reservations[msg.sender][name_hash].expires_at = new_expires;

        emit Renewed(msg.sender, name, new_expires);
    }

    //    function renew(bytes32 name, uint expires_after) public payable {
//require(msg.sender != address(0));
//require(expires_after != 0);

    //
    //        address memory old_owner = name_current_owners[name_hash];
    //        uint old_expires = user_name_reservations[old_owner][name_hash];
    //
    //        assert(old_owner == msg.sender && old_expires >= block.number);
    //
    //        user_name_reservations[msg.sender][name_hash] = block.number;
    //
    //        emit Renewed(msg.sender, name, new_expires);
    //    }

}
