import axios from "axios";

// Replace with your computer's local IP address when testing on phone
// Run "ipconfig" in CMD to find your IPv4 address e.g. 192.168.x.x
const BASE_URL = "http://10.219.144.231:8002";

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
  const { data } = await api.get("/knowledge/search", {
    params: { q: query, top_k: topK },
  });
  return data;
};

export const listSources = async () => {
  const { data } = await api.get("/knowledge/sources");
  return data;
};

export const getBlockchainStatus = async () => {
  const { data } = await api.get("/blockchain/status");
  return data;
};

export const setBaseURL = (ip) => {
  api.defaults.baseURL = `http://${ip}:8002`;
};
