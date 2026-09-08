import React, { useState, useEffect } from "react";
import { Wallet, BookOpen, Activity } from "lucide-react";
import ChatWindow from "./components/ChatWindow";
import LanguageSelector from "./components/LanguageSelector";
import KnowledgeBrowser from "./components/KnowledgeBrowser";
import useChatStore from "./store/chatStore";
import { connectWallet, getVDTBalance } from "./services/blockchain";
import { getBlockchainStatus } from "./services/api";

const VDT_TOKEN_ADDRESS = import.meta.env.VITE_VDT_TOKEN || "";

export default function App() {
  const [showBrowser, setShowBrowser] = useState(false);
  const [vdtBalance, setVdtBalance] = useState("0");
  const [chainStatus, setChainStatus] = useState(null);

  const {
    blockchainConnected,
    walletAddress,
    setBlockchainConnected,
    setWalletAddress,
  } = useChatStore();

  // Check blockchain status on load
  useEffect(() => {
    getBlockchainStatus()
      .then((s) => {
        setChainStatus(s);
        setBlockchainConnected(s.connected);
      })
      .catch(() => setBlockchainConnected(false));
  }, []);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      const balance = await getVDTBalance(VDT_TOKEN_ADDRESS, address);
      setVdtBalance(balance);
    } catch (err) {
      alert(err.message);
    }
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800/60 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-600 to-saffron-800 flex items-center justify-center">
              <span className="text-xl">🕉</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-100 leading-none">VedaBot</h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Vedic Knowledge AI</p>
            </div>
          </div>

          {/* Language selector (hidden on small screens, shown inline on md+) */}
          <div className="hidden md:flex flex-1 justify-center">
            <LanguageSelector />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Blockchain status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <Activity
                size={10}
                className={blockchainConnected ? "text-green-400" : "text-gray-600"}
              />
              <span className={blockchainConnected ? "text-green-400" : "text-gray-600"}>
                {blockchainConnected ? "Shardeum" : "Offline"}
              </span>
              {chainStatus?.total_response_logs > 0 && (
                <span className="text-gray-600">({chainStatus.total_response_logs} logs)</span>
              )}
            </div>

            {/* Knowledge browser */}
            <button
              onClick={() => setShowBrowser(!showBrowser)}
              className={`p-2 rounded-lg transition-colors ${
                showBrowser
                  ? "bg-saffron-600/20 text-saffron-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
              title="Knowledge Browser"
            >
              <BookOpen size={16} />
            </button>

            {/* Wallet */}
            <button
              onClick={handleConnectWallet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700
                         border border-gray-700/60 text-xs text-gray-300 transition-colors"
            >
              <Wallet size={12} />
              {walletAddress ? (
                <span className="font-mono">{shortAddress}</span>
              ) : (
                <span>Connect</span>
              )}
            </button>
          </div>
        </div>

        {/* Language selector for mobile */}
        <div className="md:hidden px-4 pb-3">
          <LanguageSelector />
        </div>

        {/* VDT balance */}
        {walletAddress && parseFloat(vdtBalance) > 0 && (
          <div className="px-4 pb-2">
            <span className="text-xs text-saffron-400">
              {parseFloat(vdtBalance).toFixed(2)} VDT
            </span>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 flex max-w-5xl w-full mx-auto relative">
        {/* Chat */}
        <div
          className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
            showBrowser ? "md:mr-80" : ""
          }`}
          style={{ height: "calc(100vh - 64px)" }}
        >
          <ChatWindow />
        </div>

        {/* Knowledge browser panel */}
        {showBrowser && (
          <div className="absolute right-0 top-0 w-full md:w-80 h-full bg-gray-900 border-l border-gray-800/60 z-20 flex flex-col">
            <KnowledgeBrowser onClose={() => setShowBrowser(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
