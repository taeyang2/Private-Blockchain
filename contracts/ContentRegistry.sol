// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ContentRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct ContentRecord {
        bytes32  contentHash;
        address  creator;
        uint256  timestamp;
    }

    mapping(bytes32 => ContentRecord) private _records;

    event ContentRegistered(
        bytes32 indexed contentHash,
        address indexed creator,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender);
    }

    function registerContent(bytes32 contentHash) external onlyRole(REGISTRAR_ROLE) {
        require(_records[contentHash].timestamp == 0, "Already registered");
        _records[contentHash] = ContentRecord({
            contentHash: contentHash,
            creator: msg.sender,
            timestamp: block.timestamp
        });
        emit ContentRegistered(contentHash, msg.sender, block.timestamp);
    }

    function getContent(bytes32 contentHash) external view returns (ContentRecord memory) {
        require(_records[contentHash].timestamp != 0, "Not registered");
        return _records[contentHash];
    }

    function isRegistered(bytes32 contentHash) external view returns (bool) {
        return _records[contentHash].timestamp != 0;
    }
}