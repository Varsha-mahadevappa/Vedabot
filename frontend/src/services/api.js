import axios from "axios";

const BASE_URL = "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export const sendMessage = async ({ message, language, sessionId, history }) => {
  const { data } = await api.post("/chat", {
    message,
    language,
    session_id: sessionId || undefined,
    history: history || [],
  });
  return data;
};

export const searchKnowledge = async (query, topK = 5) => {
  const { data } = await api.get("/knowledge/search", { params: { q: query, top_k: topK } });
  return data;
};

export const listSources = async () => {
  const { data } = await api.get("/knowledge/sources");
  return data;
};

export const listCategories = async () => {
  const { data } = await api.get("/knowledge/categories");
  return data;
};

export const verifySource = async (sourceHash) => {
  const { data } = await api.post("/blockchain/verify", { source_hash: sourceHash });
  return data;
};

export const getBlockchainStatus = async () => {
  const { data } = await api.get("/blockchain/status");
  return data;
};

export const contributeKnowledge = async (payload) => {
  const { data } = await api.post("/blockchain/contribute", payload);
  return data;
};

export const healthCheck = async () => {
  const { data } = await api.get("/health");
  return data;
};
