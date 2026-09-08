import { create } from "zustand";

const useChatStore = create((set, get) => ({
  messages: [],
  sessionId: null,
  language: "en",
  isLoading: false,
  error: null,

  setLanguage: (lang) => set({ language: lang }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSessionId: (sessionId) => set({ sessionId }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () =>
    set({ messages: [], sessionId: null, error: null }),

  getHistory: () => {
    const { messages } = get();
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));
  },
}));

export default useChatStore;
