// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ResponseLog
/// @notice Append-only, tamper-proof log of VedaBot chatbot responses on Shardeum
contract ResponseLog {

    // ─── Structs ───────────────────────────────────────────────────────────────

    struct ResponseEntry {
        bytes32 questionHash;
        bytes32 answerHash;
        bytes32[] sourceHashes;
        uint256 timestamp;
        address logger;
    }

    // ─── State ─────────────────────────────────────────────────────────────────

    address public owner;
    address public authorizedLogger;    // VedaBot backend wallet

    ResponseEntry[] private responses;

    // ─── Events ────────────────────────────────────────────────────────────────

    event ResponseLogged(
        uint256 indexed responseId,
        bytes32 questionHash,
        bytes32 answerHash,
        uint256 timestamp
    );

    event LoggerUpdated(address oldLogger, address newLogger);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "ResponseLog: not owner");
        _;
    }

    modifier onlyLogger() {
        require(
            msg.sender == authorizedLogger || msg.sender == owner,
            "ResponseLog: not authorized logger"
        );
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        authorizedLogger = msg.sender;
    }

    // ─── Write Functions ───────────────────────────────────────────────────────

    /// @notice Log a chatbot Q&A response immutably
    /// @param questionHash SHA-256 hash of the user question
    /// @param answerHash SHA-256 hash of the bot's answer
    /// @param sourceHashes Array of source document hashes used in this response
    /// @return responseId The index of this response in the log
    function logResponse(
        bytes32 questionHash,
        bytes32 answerHash,
        bytes32[] calldata sourceHashes
    ) external onlyLogger returns (uint256 responseId) {
        responseId = responses.length;
        responses.push(ResponseEntry({
            questionHash: questionHash,
            answerHash: answerHash,
            sourceHashes: sourceHashes,
            timestamp: block.timestamp,
            logger: msg.sender
        }));
        emit ResponseLogged(responseId, questionHash, answerHash, block.timestamp);
    }

    /// @notice Update the authorized logger address
    function setLogger(address newLogger) external onlyOwner {
        emit LoggerUpdated(authorizedLogger, newLogger);
        authorizedLogger = newLogger;
    }

    // ─── Read Functions ────────────────────────────────────────────────────────

    /// @notice Get total number of logged responses
    function getTotalResponses() external view returns (uint256) {
        return responses.length;
    }

    /// @notice Get a specific response entry by ID
    function getResponse(uint256 responseId)
        external
        view
        returns (
            bytes32 questionHash,
            bytes32 answerHash,
            uint256 timestamp,
            address logger,
            bytes32[] memory sourceHashes
        )
    {
        require(responseId < responses.length, "ResponseLog: invalid responseId");
        ResponseEntry memory entry = responses[responseId];
        return (
            entry.questionHash,
            entry.answerHash,
            entry.timestamp,
            entry.logger,
            entry.sourceHashes
        );
    }

    /// @notice Get the latest N responses
    function getLatestResponses(uint256 count)
        external
        view
        returns (uint256[] memory ids, bytes32[] memory questionHashes, uint256[] memory timestamps)
    {
        uint256 total = responses.length;
        uint256 size = count > total ? total : count;
        ids = new uint256[](size);
        questionHashes = new bytes32[](size);
        timestamps = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            uint256 idx = total - size + i;
            ids[i] = idx;
            questionHashes[i] = responses[idx].questionHash;
            timestamps[i] = responses[idx].timestamp;
        }
    }
}
