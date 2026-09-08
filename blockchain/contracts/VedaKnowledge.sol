// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title VedaKnowledge
/// @notice Decentralized registry for Vedic knowledge source authenticity on Shardeum
contract VedaKnowledge {

    // ─── Structs ───────────────────────────────────────────────────────────────

    struct Source {
        string title;
        string ipfsCID;       // Optional IPFS content identifier
        address registrar;
        uint256 timestamp;
        bool verified;
        uint256 stakeAmount;  // SHM staked by registrar
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    address public owner;
    address public validator;            // Address allowed to verify sources
    uint256 public minStake = 0.001 ether;

    mapping(bytes32 => Source) private sources;
    bytes32[] public sourceHashes;

    // ─── Events ────────────────────────────────────────────────────────────────

    event SourceRegistered(bytes32 indexed sourceHash, string title, address registrar, uint256 timestamp);
    event SourceVerified(bytes32 indexed sourceHash, address verifiedBy, uint256 timestamp);
    event ValidatorUpdated(address oldValidator, address newValidator);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "VedaKnowledge: not owner");
        _;
    }

    modifier onlyValidator() {
        require(msg.sender == validator || msg.sender == owner, "VedaKnowledge: not validator");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        validator = msg.sender;
    }

    // ─── Write Functions ───────────────────────────────────────────────────────

    /// @notice Register a new Vedic knowledge source hash
    /// @param sourceHash SHA-256 hash of the source document (bytes32)
    /// @param title Human-readable title of the source
    /// @param ipfsCID Optional IPFS CID for the full document
    function registerSource(
        bytes32 sourceHash,
        string calldata title,
        string calldata ipfsCID
    ) external payable {
        require(msg.value >= minStake, "VedaKnowledge: insufficient stake");
        require(sources[sourceHash].timestamp == 0, "VedaKnowledge: source already registered");
        require(bytes(title).length > 0, "VedaKnowledge: title required");

        sources[sourceHash] = Source({
            title: title,
            ipfsCID: ipfsCID,
            registrar: msg.sender,
            timestamp: block.timestamp,
            verified: false,
            stakeAmount: msg.value
        });

        sourceHashes.push(sourceHash);
        emit SourceRegistered(sourceHash, title, msg.sender, block.timestamp);
    }

    /// @notice Mark a registered source as verified (validator/owner only)
    function verifySource(bytes32 sourceHash) external onlyValidator {
        require(sources[sourceHash].timestamp != 0, "VedaKnowledge: source not found");
        require(!sources[sourceHash].verified, "VedaKnowledge: already verified");

        sources[sourceHash].verified = true;
        emit SourceVerified(sourceHash, msg.sender, block.timestamp);
    }

    /// @notice Update the validator address
    function setValidator(address newValidator) external onlyOwner {
        emit ValidatorUpdated(validator, newValidator);
        validator = newValidator;
    }

    /// @notice Update minimum stake required for registration
    function setMinStake(uint256 newMinStake) external onlyOwner {
        minStake = newMinStake;
    }

    // ─── Read Functions ────────────────────────────────────────────────────────

    /// @notice Check if a source hash is verified
    function isVerified(bytes32 sourceHash) external view returns (bool) {
        return sources[sourceHash].verified;
    }

    /// @notice Get full source metadata
    function getSource(bytes32 sourceHash)
        external
        view
        returns (
            string memory title,
            address registrar,
            uint256 timestamp,
            bool verified,
            string memory ipfsCID,
            uint256 stakeAmount
        )
    {
        Source memory s = sources[sourceHash];
        return (s.title, s.registrar, s.timestamp, s.verified, s.ipfsCID, s.stakeAmount);
    }

    /// @notice Total number of registered sources
    function totalSources() external view returns (uint256) {
        return sourceHashes.length;
    }

    /// @notice Retrieve a page of source hashes
    function getSourceHashes(uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 total = sourceHashes.length;
        if (offset >= total) return new bytes32[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        bytes32[] memory page = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = sourceHashes[i];
        }
        return page;
    }
}
