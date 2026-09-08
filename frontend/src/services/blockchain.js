import { ethers } from "ethers";

const SHARDEUM_SPHINX = {
  chainId: "0x1F92",     // 8082 in hex
  chainName: "Shardeum Sphinx 1.X",
  nativeCurrency: { name: "SHM", symbol: "SHM", decimals: 18 },
  rpcUrls: ["https://sphinx.shardeum.org/"],
  blockExplorerUrls: ["https://explorer-sphinx.shardeum.org/"],
};

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask.");
  }
  // Request accounts
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

  // Switch / add Shardeum network
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SHARDEUM_SPHINX.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SHARDEUM_SPHINX],
      });
    }
  }

  return accounts[0];
}

export async function getProvider() {
  if (!window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getVDTBalance(tokenAddress, userAddress) {
  if (!tokenAddress || !userAddress || tokenAddress === "0x" + "0".repeat(40)) return "0";
  try {
    const provider = await getProvider();
    if (!provider) return "0";
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  } catch {
    return "0";
  }
}
