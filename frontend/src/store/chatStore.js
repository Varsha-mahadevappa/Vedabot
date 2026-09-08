import { create } from "zustand";

const useChatStore = create((set, get) => ({
  // State
  messages: [],
  sessionId: null,
  language: "en",
  isLoading: false,
  error: null,
  blockchainConnected: false,
  walletAddress: null,

  // Actions
  setLanguage: (lang) => set({ language: lang }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSessionId: (sessionId) => set({ sessionId }),

  setBlockchainConnected: (connected) => set({ blockchainConnected: connected }),

  setWalletAddress: (address) => set({ walletAddress: address }),

  clearMessages: () => set({ messages: [], sessionId: null, error: null }),

  getHistory: () => {
    const { messages } = get();
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));
  },
}));

export default useChatStore;
