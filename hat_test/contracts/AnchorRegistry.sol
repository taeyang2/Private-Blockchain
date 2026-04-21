// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AnchorRegistry is AccessControl {
    bytes32 public constant ANCHOR_SUBMITTER_ROLE = keccak256("ANCHOR_SUBMITTER_ROLE");

    struct AnchorRecord {
        bytes32 merkleRoot;
        uint256 timestamp;
        uint256 besuBlockFrom;
        uint256 besuBlockTo;
    }

    mapping(bytes32 => AnchorRecord) private _anchors;

    event AnchorSubmitted(
        bytes32 indexed merkleRoot,
        uint256 besuBlockFrom,
        uint256 besuBlockTo
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ANCHOR_SUBMITTER_ROLE, msg.sender);
    }

    function submitAnchor(
        bytes32 merkleRoot,
        uint256 fromBlock,
        uint256 toBlock
    ) external onlyRole(ANCHOR_SUBMITTER_ROLE) {
        require(_anchors[merkleRoot].timestamp == 0, "Already anchored");
        require(fromBlock <= toBlock, "Invalid block range");

        _anchors[merkleRoot] = AnchorRecord({
            merkleRoot: merkleRoot,
            timestamp: block.timestamp,
            besuBlockFrom: fromBlock,
            besuBlockTo: toBlock
        });

        emit AnchorSubmitted(merkleRoot, fromBlock, toBlock);
    }

    function getAnchor(bytes32 merkleRoot) external view returns (AnchorRecord memory) {
        require(_anchors[merkleRoot].timestamp != 0, "Not anchored");
        return _anchors[merkleRoot];
    }

    function verifyContent(
        bytes32 contentHash,
        bytes32[] calldata proof,
        bytes32 merkleRoot
    ) external view returns (bool) {
        require(_anchors[merkleRoot].timestamp != 0, "Not anchored");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(contentHash))));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
