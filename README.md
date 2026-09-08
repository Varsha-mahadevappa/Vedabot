# VedaBot — Multilingual Vedic Knowledge Chatbot

> A conversational AI powered by ancient Vedic wisdom, modern LLMs, and blockchain-backed knowledge integrity.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Project Analysis](#project-analysis)
4. [Architecture](#architecture)
5. [Features](#features)
6. [Tech Stack](#tech-stack)
7. [Judging Criteria Mapping](#judging-criteria-mapping)
8. [Smart Contract Design](#smart-contract-design)
9. [Multilingual Pipeline](#multilingual-pipeline)
10. [RAG Pipeline](#rag-pipeline)
11. [Project Structure](#project-structure)
12. [Setup & Installation](#setup--installation)
13. [API Reference](#api-reference)
14. [Future Roadmap](#future-roadmap)

---

## Problem Statement

Vedic knowledge — spanning the four Vedas (Rigveda, Samaveda, Yajurveda, Atharvaveda), 108 Upanishads, Bhagavad Gita, Puranas, and Sanskrit grammar traditions — represents thousands of years of human philosophical, scientific, and spiritual thought. Yet this knowledge suffers from three critical accessibility problems:

1. **Language Barrier** — Most primary texts are in Sanskrit, making them inaccessible to the 1.4 billion Indians and millions worldwide who cannot read Devanagari script or understand Sanskrit.
2. **Fragmentation** — Knowledge is scattered across hundreds of texts with no unified, conversational interface to query it.
3. **Authenticity Risk** — Digital reproductions of ancient texts can be altered, misquoted, or misattributed, leading to the spread of misinformation about Vedic philosophy.

**VedaBot** is built to solve all three problems simultaneously.

---

## Solution Overview

VedaBot is an end-to-end, full-stack multilingual chatbot that:

- Enables natural language conversation about Vedic texts and concepts
- Supports 6 languages (English, Hindi, Sanskrit, Tamil, Telugu, Bengali)
- Uses Retrieval-Augmented Generation (RAG) to ground every answer in actual Vedic source texts
- Records knowledge source hashes and chatbot response logs immutably on the **Shardeum blockchain** (local Hardhat node)
- Rewards verified knowledge contributors with **VedaTokens (VDT)** — an ERC-20 token
- Auto-attaches Sanskrit shlokas (verses) with transliteration and translation to relevant answers
- Available on both **Web (React + Vite)** and **Android mobile (Expo React Native)**

---

## Project Analysis

### Core Challenge: Accuracy vs. Creativity in LLMs

Large Language Models hallucinate. For general trivia this is tolerable, but for ancient sacred knowledge it is unacceptable — a wrong answer about a Vedic concept could mislead millions of people about their cultural heritage.

**Solution: RAG (Retrieval-Augmented Generation)**
Instead of relying purely on the LLM's parametric memory, every query first retrieves the most semantically relevant passages from a curated Vedic corpus. These passages are injected into the LLM's context window as ground truth, dramatically reducing hallucination while preserving conversational fluency.

### Core Challenge: Multilingual Complexity

Sanskrit ↔ English translation is a deeply specialized field. Most translation models fail on Sanskrit due to limited training data. Tamil and Telugu have their own script-specific challenges.

**Solution: Layered Translation Pipeline**
1. Detect the user's input language
2. Translate input to English for RAG retrieval (English embeddings are highest quality)
3. Retrieve Vedic context in English
4. Generate LLM response in English with Sanskrit quotes preserved
5. Translate final response back to user's language
6. Attach original Sanskrit + transliteration + translation as a separate component

### Core Challenge: Knowledge Integrity on the Internet

Anyone can create a website claiming to quote the Vedas. There is no standard mechanism for verifying whether a digital Vedic source is authentic.

**Solution: On-Chain Source Hashing**
Every document ingested into the Vedic knowledge base has its SHA-256 hash stored on the blockchain via the `VedaKnowledge` smart contract. When VedaBot cites a source, the UI shows a real-time verification badge indicating whether the cited source's hash matches what is recorded on-chain.

### Why Shardeum?

Shardeum is an EVM-compatible, linearly scalable blockchain that uses dynamic state sharding. This makes it uniquely suited for VedaBot because:
- **Low transaction costs**: Logging thousands of chatbot responses on-chain is economically feasible
- **High throughput**: Scales as the chatbot user base grows
- **EVM compatibility**: Existing Solidity/Hardhat tooling works out-of-the-box
- **Decentralization**: No single point of failure for the knowledge integrity layer

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│               MOBILE (Expo React Native — Android)                    │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Chat Screen │  │  Lang Select │  │ Sanskrit  │  │ Knowledge  │  │
│  │  (Zustand)   │  │  (6 langs)   │  │  Quotes   │  │  Browser   │  │
│  └──────────────┘  └──────────────┘  └───────────┘  └────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                  WEB FRONTEND (React + Vite + TailwindCSS)             │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Chat Window │  │  Lang Select │  │ Sanskrit  │  │ Blockchain │  │
│  │  (Streaming) │  │  (6 langs)   │  │  Quotes   │  │   Badge    │  │
│  └──────────────┘  └──────────────┘  └───────────┘  └────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP (port 8002)
┌────────────────────────────▼─────────────────────────────────────────┐
│                        BACKEND (FastAPI)                               │
│                                                                        │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────────────────┐   │
│  │   /chat    │   │  /knowledge  │   │       /blockchain        │   │
│  │   Router   │   │   Router     │   │         Router           │   │
│  └─────┬──────┘   └──────┬───────┘   └────────────┬─────────────┘   │
│        │                 │                         │                  │
│  ┌─────▼──────┐   ┌──────▼───────┐   ┌────────────▼─────────────┐   │
│  │LLM Service │   │  RAG Service │   │    Blockchain Service    │   │
│  │(Groq API   │   │  (ChromaDB + │   │    (Web3.py + Hardhat)   │   │
│  │ Llama 3.3) │   │  MiniLM-L6)  │   │                          │   │
│  └─────┬──────┘   └──────┬───────┘   └──────────────────────────┘   │
│        │                 │                                            │
│  ┌─────▼─────────────────▼─────────────────────────────────────┐    │
│  │              Translation Service (deep-translator)           │    │
│  └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
           ┌─────────────────▼────────────────────┐
           │         Vedic Knowledge Base          │
           │                                       │
           │  Rigveda · Upanishads (12 principal)  │
           │  Bhagavad Gita · Yoga Sutras           │
           │  Sanskrit Concepts Glossary            │
           └─────────────────────────────────────--┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│              BLOCKCHAIN (Local Hardhat Node / Shardeum EVM)            │
│                                                                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────┐   │
│  │ VedaKnowledge   │  │   ResponseLog    │  │   VedaToken       │   │
│  │ .sol            │  │   .sol           │  │   .sol (ERC-20)   │   │
│  │                 │  │                  │  │                   │   │
│  │ Store source    │  │ Tamper-proof log │  │ Reward knowledge  │   │
│  │ hashes &        │  │ of all chatbot   │  │ contributors with │   │
│  │ verify them     │  │ responses        │  │ VDT tokens        │   │
│  └─────────────────┘  └──────────────────┘  └───────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Chat & Conversation
| Feature | Description |
|---|---|
| Conversational AI | Multi-turn context-aware chat powered by Llama 3.3 70B via Groq |
| Conversation History | Last 6 messages maintained per session for context |
| Source Citations | Every answer cites the Vedic text, chapter, and verse it draws from |
| Sanskrit Quotes | Auto-attached shlokas with Devanagari, IAST transliteration, and English translation |
| Context Recommendations | Suggests 3 related Vedic topics after each answer (clickable chips) |
| Confidence Score | LLM self-rates confidence (High / Medium / Low) per answer |
| Blockchain Badge | Shows "Logged on Shardeum" for every response recorded on-chain |

### Multilingual Support
| Language | Code | Script |
|---|---|---|
| English | en | Latin |
| Hindi | hi | Devanagari |
| Sanskrit | sa | Devanagari |
| Tamil | ta | Tamil |
| Telugu | te | Telugu |
| Bengali | bn | Bengali |

### Knowledge Base
| Collection | Contents |
|---|---|
| Rigveda | Hymns from the oldest Vedic text |
| Upanishads | 12 principal Upanishads (Isha, Kena, Katha, Mundaka, etc.) |
| Bhagavad Gita | All 18 chapters with key verses |
| Yoga Sutras | Patanjali's sutras on yoga philosophy |
| Sanskrit Glossary | Key Sanskrit terms with etymology and meaning |

### Blockchain Features
| Feature | Contract | Description |
|---|---|---|
| Source Verification | VedaKnowledge.sol | SHA-256 hash of each Vedic source stored on-chain |
| Response Logging | ResponseLog.sol | Every chatbot Q&A pair hashed and logged immutably |
| Knowledge Contribution | VedaKnowledge.sol | Register new Vedic sources on-chain |
| VedaToken Rewards | VedaToken.sol | Contributors earn VDT tokens (ERC-20) |
| Verification Badge | Frontend + Mobile | Real-time green badge for on-chain verified sources |

### Mobile App (Android)
| Feature | Description |
|---|---|
| Native Chat UI | Full VedaBot chat experience on Android |
| Language Selector | Switch between 6 languages from the app |
| Sanskrit Quote Cards | Native Devanagari rendering with expand/collapse |
| Source Panel | View all cited Vedic passages inline |
| Knowledge Browser | Search Vedic texts, browse sources, check blockchain status |
| Blockchain Status | View connected contracts and logged response counts |

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Mobile Framework | Expo React Native | SDK 54 | Android app |
| Mobile State | Zustand | 5.x | Chat state management |
| Web Frontend | React + Vite | 18.x / 5.x | Web chat interface |
| Web Styling | TailwindCSS | 3.x | Utility-first responsive design |
| Backend Framework | FastAPI | 0.115+ | Async Python REST API |
| LLM | Groq API (Llama 3.3 70B) | latest | Core reasoning and generation |
| LLM HTTP | requests library | 2.x | Direct HTTP to Groq (bypasses SDK DNS issues) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | 3.x | Semantic vector embeddings |
| Vector Database | ChromaDB | 0.5+ | Persistent RAG retrieval |
| Translation | deep-translator | 1.x | Multilingual translation (Google backend) |
| Language Detection | langdetect | 1.x | Auto-detect input language |
| Blockchain Framework | Hardhat | 2.x | Smart contract development & local node |
| Smart Contracts | Solidity | 0.8.x | EVM-compatible contracts |
| Blockchain Network | Local Hardhat node (Shardeum EVM-compatible) | — | Decentralized knowledge layer |
| Web3 Python | Web3.py | 7.x | Backend ↔ blockchain interaction |
| Database | SQLite + SQLAlchemy (aiosqlite) | — | Session and contribution storage |
| HTTP Client | Axios | 1.x | API calls from frontend and mobile |

---

## Judging Criteria Mapping

### Full Stack Development — 30%

```
UI/UX
  ✅ Clean dark-themed chat interface (Web + Android)
  ✅ Mobile-first responsive design
  ✅ Language selector with 6 language options
  ✅ Sanskrit quote cards with Devanagari typography
  ✅ Knowledge browser for searching and exploring Vedic texts
  ✅ Clickable related topic chips for follow-up questions

Features
  ✅ Multi-turn conversation with context
  ✅ Auto-language detection
  ✅ Full source citation panel per message (expandable)
  ✅ Context-based topic recommendations
  ✅ Confidence scoring per answer
  ✅ Blockchain verification badge per cited source
  ✅ Android mobile app with full feature parity

Scalability
  ✅ ChromaDB supports millions of vector embeddings
  ✅ FastAPI is async — handles concurrent users efficiently
  ✅ Stateless backend — horizontal scaling ready
  ✅ Shardeum scales linearly via dynamic state sharding
```

### Blockchain Integration — 30%

```
Smart Contracts
  ✅ VedaKnowledge.sol — source hash registry with staking
  ✅ ResponseLog.sol — immutable Q&A response ledger
  ✅ VedaToken.sol — ERC-20 token with mint/burn mechanics

Proper Usage
  ✅ On-chain operations are meaningful (not cosmetic)
  ✅ Source verification solves a real authenticity problem
  ✅ Response logging creates an auditable AI knowledge trail
  ✅ Token incentives align contributor behavior with quality
  ✅ All 5 Vedic sources registered and verified on-chain
  ✅ Every chat response logged with question hash + answer hash

Innovation
  ✅ First chatbot to anchor Vedic knowledge authenticity on blockchain
  ✅ Decentralized peer-review model for knowledge contribution
  ✅ VedaToken creates a micro-economy around Vedic scholarship
```

### Innovation & Impact — 40%

```
Creativity
  ✅ RAG over ancient Sanskrit corpus — novel application of modern AI
  ✅ Sanskrit preservation via conversational interface
  ✅ Blockchain as a cultural heritage protection mechanism
  ✅ Token economy for incentivizing scholarly contribution
  ✅ Multilingual pipeline preserving Sanskrit quotes while translating answers

Real-World Applicability
  ✅ Students researching Indian philosophy and culture
  ✅ Sanskrit scholars needing a fast reference tool
  ✅ Diaspora communities reconnecting with their roots
  ✅ Educators building multilingual Vedic curricula
  ✅ Publishers wanting to verify text authenticity
  ✅ Spiritual seekers exploring Vedic concepts across languages

Platform Reach
  ✅ Web app (React) — desktop and browser users
  ✅ Android mobile app (Expo React Native) — smartphone users
```

---

## Smart Contract Design

### VedaKnowledge.sol
```
Purpose : Registry of verified Vedic knowledge sources
Storage : sourceHash → SourceRecord (title, author, timestamp, verifiedBy, stakeAmount)
Functions:
  - registerSource(hash, title, ipfsCID) → store new source with stake
  - verifySource(hash) → approve source (owner/validator role)
  - getSource(hash) → retrieve source metadata
  - isVerified(hash) → bool — used by frontend badge
Events  : SourceRegistered, SourceVerified
Deployed: Local Hardhat node (0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
```

### ResponseLog.sol
```
Purpose : Tamper-proof log of every chatbot response
Storage : responseId → ResponseRecord (questionHash, answerHash, timestamp, sourceHashes[])
Functions:
  - logResponse(questionHash, answerHash, sourceHashes) → append-only log
  - getResponse(responseId) → retrieve log entry
  - getTotalResponses() → count
Events  : ResponseLogged
Deployed: Local Hardhat node (0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0)
```

### VedaToken.sol (ERC-20)
```
Purpose : Incentive token for verified knowledge contributors
Symbol  : VDT
Supply  : 10,000,000 VDT initial supply (mintable by owner)
Functions:
  - Standard ERC-20 (transfer, approve, allowance)
  - reward(address contributor, uint256 amount) → mint reward
  - burn(uint256 amount) → contributor can burn tokens
Events  : Transfer (standard), KnowledgeRewarded
Deployed: Local Hardhat node (0x5FbDB2315678afecb367f032d93F642f64180aa3)
```

---

## Multilingual Pipeline

```
User Input (any language)
        │
        ▼
┌───────────────────┐
│  Language Detect  │  langdetect → ISO 639-1 code (hi, ta, sa, etc.)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Translate → EN    │  deep-translator (Google backend)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  RAG Retrieval    │  ChromaDB semantic search in English embedding space
│  (Top-5 chunks)   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  LLM Generation   │  Groq API (Llama 3.3 70B) with Vedic context
│  (English output) │  Responds with JSON: answer + sanskrit_quote + confidence
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Translate → User  │  Translate back to detected language
│ Language          │  (Sanskrit quotes always kept in original Devanagari)
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Blockchain Log    │  Hash Q&A pair → log to ResponseLog.sol
└────────┬──────────┘
         │
         ▼
  Final Response
  (User's language + Sanskrit shloka card + source citations + confidence)
```

---

## RAG Pipeline

```
INGESTION (one-time, run ingest.py)
  Vedic Text Files (TXT)
        │
        ▼
  Text Chunking (paragraph-level with metadata)
        │
        ▼
  Embed with sentence-transformers/all-MiniLM-L6-v2
  (model pre-loaded at module level to avoid async conflicts)
        │
        ▼
  Store in ChromaDB with metadata:
    { source, text_name, chapter, verse }
        │
        ▼
  Compute SHA-256(source_title) → register on VedaKnowledge.sol

RETRIEVAL (per query)
  User Query (translated to EN)
        │
        ▼
  Embed query vector
        │
        ▼
  ChromaDB cosine similarity → Top 5 chunks
        │
        ▼
  Check chunk source hashes against on-chain registry
  (verified_on_chain = true if hash found in VedaKnowledge.sol)
        │
        ▼
  Inject chunks as context into Groq LLM prompt
```

---

## Project Structure

```
FinalProject/
│
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py                    ← FastAPI app (port 8002, CORS enabled)
│   │   ├── config.py                  ← Pydantic settings (groq_api_key, etc.)
│   │   ├── database.py                ← SQLAlchemy async setup (aiosqlite)
│   │   │
│   │   ├── routers/
│   │   │   ├── chat.py                ← POST /chat (full pipeline)
│   │   │   ├── knowledge.py           ← GET /knowledge/search, /knowledge/sources
│   │   │   └── blockchain.py          ← GET /blockchain/status, POST /blockchain/contribute
│   │   │
│   │   ├── services/
│   │   │   ├── llm_service.py         ← Groq API via requests (Llama 3.3 70B)
│   │   │   ├── rag_service.py         ← ChromaDB + sentence-transformers
│   │   │   ├── translation_service.py ← langdetect + deep-translator
│   │   │   └── blockchain_service.py  ← Web3.py v7 + 3 smart contracts
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py             ← Pydantic models (ChatRequest, ChatResponse, etc.)
│   │   │
│   │   └── data/
│   │       ├── ingest.py              ← Corpus ingestion + on-chain registration
│   │       └── vedic_corpus/
│   │           ├── bhagavad_gita.txt
│   │           ├── upanishads.txt
│   │           ├── rigveda.txt
│   │           ├── yoga_sutras.txt
│   │           └── sanskrit_concepts.txt
│   │
│   ├── requirements.txt
│   └── .env                           ← GROQ_API_KEY, contract addresses, etc.
│
├── blockchain/
│   ├── contracts/
│   │   ├── VedaKnowledge.sol          ← Source hash registry
│   │   ├── ResponseLog.sol            ← Immutable response ledger
│   │   └── VedaToken.sol              ← ERC-20 reward token (VDT)
│   │
│   ├── scripts/
│   │   ├── deploy.js                  ← Deploy all 3 contracts
│   │   └── seed.js                    ← Register 5 Vedic sources on-chain
│   │
│   ├── hardhat.config.js              ← Localhost + Shardeum Sphinx config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx         ← Main chat UI with streaming
│   │   │   ├── MessageBubble.jsx      ← Message renderer + topic chips
│   │   │   ├── SanskritQuote.jsx      ← Shloka card component
│   │   │   └── SourceCitation.jsx     ← Expandable source panel
│   │   │
│   │   ├── services/
│   │   │   └── api.js                 ← Axios client (port 8002)
│   │   │
│   │   ├── store/
│   │   │   └── chatStore.js           ← Zustand global state
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── vite.config.js                 ← Proxy to :8002
│   └── package.json
│
└── mobile/                            ← Expo React Native (Android)
    ├── App.js                         ← Root with bottom tab navigation
    ├── app.json
    ├── package.json                   ← Expo SDK 54
    └── src/
        ├── components/
        │   ├── MessageBubble.jsx      ← Native chat bubbles
        │   └── SanskritQuote.jsx      ← Native Sanskrit card
        │
        ├── screens/
        │   ├── ChatScreen.jsx         ← Main chat screen
        │   └── KnowledgeScreen.jsx    ← Search + sources + blockchain tabs
        │
        ├── services/
        │   └── api.js                 ← Axios client (configurable LAN IP)
        │
        └── store/
            └── chatStore.js           ← Zustand state
```

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- Groq API Key (free at console.groq.com)
- Android phone with Expo Go app (for mobile)

### Environment Variables

**backend/.env**
```
GROQ_API_KEY=your_groq_api_key
CHROMA_DB_PATH=./chroma_db
SHARDEUM_RPC_URL=http://127.0.0.1:8545
VEDA_KNOWLEDGE_CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
RESPONSE_LOG_CONTRACT=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VEDA_TOKEN_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DATABASE_URL=sqlite+aiosqlite:///./vedabot.db
```

### Running the Project

**Terminal 1 — Blockchain node**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2 — Backend**
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

**Terminal 3 — Web frontend**
```bash
cd frontend
npm run dev
# Opens at http://localhost:5175
```

**Terminal 4 — Mobile app (Android)**
```bash
cd mobile
# Update src/services/api.js with your local IP (run ipconfig)
set REACT_NATIVE_PACKAGER_HOSTNAME=YOUR_IP && npx expo start
# Scan QR code with Expo Go on Android
```

**One-time corpus ingestion (first run only)**
```bash
cd backend
.venv\Scripts\activate
python -m app.data.ingest
```

**One-time blockchain seed (first run only)**
```bash
cd blockchain
npx hardhat run scripts/seed.js --network localhost
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Send message, receive full Vedic response with sources |
| GET | `/knowledge/search?q=karma` | Semantic search across Vedic corpus |
| GET | `/knowledge/sources` | List all Vedic sources with on-chain status |
| GET | `/blockchain/status` | Blockchain connection, contract status, stats |
| POST | `/blockchain/contribute` | Submit a new Vedic source for registration |
| GET | `/health` | API health check |

### Chat Request/Response

```json
POST /chat
{
  "message": "What is karma?",
  "language": "en",
  "session_id": "optional-uuid",
  "history": []
}

Response:
{
  "answer": "Karma is the law of cause and effect...",
  "confidence": "high",
  "sanskrit_quote": {
    "devanagari": "कर्मण्येवाधिकारस्ते...",
    "transliteration": "karmanye vadhikaraste...",
    "translation": "You have a right to perform your duties...",
    "source": "Bhagavad Gita 2.47"
  },
  "related_topics": ["dharma", "moksha", "yoga"],
  "sources": [
    {
      "text_name": "Bhagavad Gita",
      "chapter": "Chapter 2",
      "verse": "47",
      "excerpt": "...",
      "verified_on_chain": true
    }
  ],
  "logged_on_chain": true,
  "session_id": "uuid"
}
```

---

## Key Technical Decisions

| Decision | Why |
|---|---|
| Groq API (Llama 3.3 70B) instead of Claude | Groq is free; Claude API had no credits |
| `requests` library instead of Groq SDK | College network DNS was blocking the SDK's httpx connections |
| Local Hardhat node instead of Shardeum testnet | Shardeum testnet RPC was unreachable (`Could not fetch chain ID`) |
| `local_files_only=True` for sentence-transformers | Avoids async httpx conflict in sentence-transformers v5 |
| `raw_transaction` instead of `rawTransaction` | Web3.py v7 breaking API change |
| SHA-256(source_title) as hash key | Aligns ingest.py hash with seed.js on-chain registration |
| Mobile hotspot for Expo Go | College network blocks device-to-device communication on port 8081 |

---

## Future Roadmap

| Phase | Feature |
|---|---|
| v1.1 | Voice input/output with Sanskrit text-to-speech |
| v1.2 | IPFS storage for full Vedic text documents (decentralized) |
| v1.3 | DAO governance for VedaToken holders to vote on new sources |
| v1.4 | iOS app support (requires Mac + Xcode) |
| v1.5 | Academic citation export (BibTeX, APA) for research use |
| v1.6 | Deploy to Shardeum mainnet when stable |
| v2.0 | Fine-tuned Sanskrit LLM model trained on complete Vedic corpus |

---

## Vedic Knowledge Sources

All texts used are in the public domain. Primary sources:

- **Rigveda** — Griffith translation (1896), public domain
- **Bhagavad Gita** — Classical translation, widely reproduced
- **108 Upanishads** — Various Sanskrit scholars
- **Yoga Sutras of Patanjali** — Classical translation
- **Sanskrit Glossary** — Key philosophical terms and concepts

---

## Team

Built for the Vedic Knowledge Hackathon.

---

*"Satyam eva jayate" — Truth alone triumphs. (Mundaka Upanishad 3.1.6)*
