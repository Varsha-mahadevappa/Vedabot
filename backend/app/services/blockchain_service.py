"""
Blockchain Service: Web3.py integration with Shardeum smart contracts.
Handles source verification, response logging, and token rewards.
"""

import json
from pathlib import Path
from web3 import Web3
from app.config import get_settings

settings = get_settings()
_w3 = None

# Minimal ABIs — only the functions we call
VEDA_KNOWLEDGE_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "sourceHash", "type": "bytes32"},
            {"internalType": "string", "name": "title", "type": "string"},
            {"internalType": "string", "name": "ipfsCID", "type": "string"},
        ],
        "name": "registerSource",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "sourceHash", "type": "bytes32"}],
        "name": "isVerified",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "sourceHash", "type": "bytes32"}],
        "name": "getSource",
        "outputs": [
            {"internalType": "string", "name": "title", "type": "string"},
            {"internalType": "address", "name": "registrar", "type": "address"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "bool", "name": "verified", "type": "bool"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]

RESPONSE_LOG_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "questionHash", "type": "bytes32"},
            {"internalType": "bytes32", "name": "answerHash", "type": "bytes32"},
            {"internalType": "bytes32[]", "name": "sourceHashes", "type": "bytes32[]"},
        ],
        "name": "logResponse",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getTotalResponses",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "uint256", "name": "responseId", "type": "uint256"}],
        "name": "getResponse",
        "outputs": [
            {"internalType": "bytes32", "name": "questionHash", "type": "bytes32"},
            {"internalType": "bytes32", "name": "answerHash", "type": "bytes32"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]


def _get_w3() -> Web3:
    global _w3
    if _w3 is None:
        _w3 = Web3(Web3.HTTPProvider(settings.shardeum_rpc_url))
    return _w3


def _hex_to_bytes32(hex_str: str) -> bytes:
    """Convert a hex string (with or without 0x) to bytes32."""
    if hex_str.startswith("0x"):
        hex_str = hex_str[2:]
    return bytes.fromhex(hex_str.ljust(64, "0")[:64])


def is_connected() -> bool:
    try:
        return _get_w3().is_connected()
    except Exception:
        return False


def verify_source(source_hash: str) -> dict:
    """Check if a source hash is verified on-chain."""
    try:
        w3 = _get_w3()
        if not w3.is_connected():
            return {"verified": False, "error": "Blockchain not connected"}

        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.veda_knowledge_contract),
            abi=VEDA_KNOWLEDGE_ABI,
        )
        hash_bytes = _hex_to_bytes32(source_hash)
        verified = contract.functions.isVerified(hash_bytes).call()

        result = {"hash": source_hash, "verified": verified}
        if verified:
            title, registrar, timestamp, _ = contract.functions.getSource(hash_bytes).call()
            result.update({"title": title, "timestamp": timestamp, "registrar": registrar})
        return result
    except Exception as e:
        return {"verified": False, "error": str(e)}


def log_response_on_chain(question_hash: str, answer_hash: str, source_hashes: list[str]) -> dict:
    """Log a chatbot Q&A response hash to the ResponseLog contract."""
    try:
        w3 = _get_w3()
        if not w3.is_connected():
            return {"success": False, "error": "Blockchain not connected"}
        if not settings.wallet_private_key:
            return {"success": False, "error": "No wallet configured"}

        account = w3.eth.account.from_key(settings.wallet_private_key)
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.response_log_contract),
            abi=RESPONSE_LOG_ABI,
        )

        q_bytes = _hex_to_bytes32(question_hash)
        a_bytes = _hex_to_bytes32(answer_hash)
        # Deduplicate and cap at 5 source hashes
        unique_hashes = list(dict.fromkeys(source_hashes))[:5]
        s_bytes = [_hex_to_bytes32(h) for h in unique_hashes]

        tx = contract.functions.logResponse(q_bytes, a_bytes, s_bytes).build_transaction({
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 500000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx, settings.wallet_private_key)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        return {"success": True, "tx_hash": tx_hash.hex()}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_response_log_count() -> int:
    """Return total logged responses on-chain."""
    try:
        w3 = _get_w3()
        if not w3.is_connected():
            return 0
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.response_log_contract),
            abi=RESPONSE_LOG_ABI,
        )
        return contract.functions.getTotalResponses().call()
    except Exception:
        return 0
