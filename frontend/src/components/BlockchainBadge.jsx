import React from "react";
import { ShieldCheck, Shield } from "lucide-react";

export default function BlockchainBadge({ verified, txHash, loggedOnChain }) {
  if (loggedOnChain) {
    return (
      <span className="blockchain-badge-verified">
        <ShieldCheck size={10} />
        Logged on Shardeum
      </span>
    );
  }
  if (verified) {
    return (
      <span className="blockchain-badge-verified">
        <ShieldCheck size={10} />
        Verified on-chain
      </span>
    );
  }
  return (
    <span className="blockchain-badge-unverified">
      <Shield size={10} />
      Not on-chain
    </span>
  );
}
