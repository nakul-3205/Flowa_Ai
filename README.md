Note:
The application was built and tested successfully during development. Over time, framework updates introduced breaking changes, so the live deployment is not actively maintained. The focus of this repository is on backend architecture, AI orchestration logic, and system design choices.

# 🌊 Flowa AI

A full-stack AI chat application built with **Next.js 15** that aggregates responses from multiple large language models — DeepSeek, Gemini, GPT (Open Source), Mistral, and LLaMA — and intelligently picks the best answer for every query.

---

## ✨ Features

- **Multi-Model Aggregation** — Queries are sent to 5 AI models in parallel; the most semantically relevant response is returned using vector similarity.
- **Web Search Integration** — Automatically detects when a query requires real-time information and enriches the prompt with Tavily web search results before hitting the models.
- **Prompt Moderation** — Built-in keyword + regex-based safety layer that detects and blocks malicious or jailbreak prompts, logs them, and can temporarily or permanently ban users.
- **User Authentication** — Powered by [Clerk](https://clerk.com) with webhooks to sync user data.
- **Chat Persistence** — Conversations are stored in MongoDB (via Mongoose) with gzip compression on message content.
- **Ban / Unban System** — Flagged users are tracked in PostgreSQL (via Prisma). GitHub Actions workflow automates scheduled unbanning.
- **Rate Limiting** — Request rate limiting via `express-rate-limit` and Redis (Upstash + ioredis).
- **Queue Processing** — BullMQ for background job processing.
- **Dockerized** — Ships with a `Dockerfile` for easy containerized deployment.
- **CI/CD** — GitHub Actions workflows for pinging the Render deployment and auto-unbanning users.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Auth | Clerk |
| Primary DB | MongoDB (Mongoose) |
| Secondary DB | PostgreSQL (Prisma) |
| Cache / Queue | Redis (Upstash + ioredis), BullMQ |
| AI Models | DeepSeek, Gemini, GPT-OSS, Mistral, LLaMA |
| Web Search | Tavily API |
| Embeddings | @xenova/transformers (local) |
| Animation | Framer Motion |
| Logging | Winston |
| Deployment | Docker, Render |

---

## 📁 Project Structure

```
flowa-ai/
├── agents/             # Individual AI model agent wrappers
│   ├── IAgent.ts       # Common interface for all agents
│   ├── DeepSeekAgent.ts
│   ├── geminiAgent.ts
│   ├── GPTOSSAgent.ts
│   ├── LlamaAgent.ts
│   └── MistralAgent.ts
├── app/
│   ├── api/            # Next.js API routes
│   │   ├── chat/       # Store & retrieve chat messages
│   │   ├── chats/      # Fetch all chats for a user
│   │   ├── query/      # Main AI query aggregation endpoint
│   │   └── webhooks/   # Clerk user sync webhook
│   └── (frontend)/     # Pages: sign-in, sign-up, chat, settings
├── components/         # Reusable UI components (shadcn/ui + custom)
├── lib/                # Core utilities: DB connection, aggregator, ban logic
├── models/             # Mongoose schemas (Chat, User)
├── prisma/             # Prisma schema + migrations (PostgreSQL)
├── prompts/            # System prompts for each AI model
├── utils/              # Similarity scoring, prompt moderator, shouldSearch
├── hooks/              # Custom React hooks
├── .github/workflows/  # CI/CD pipelines
├── Dockerfile
└── env.sample
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 18
- A running MongoDB instance
- A running PostgreSQL instance
- Redis instance (Upstash recommended)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/flowa-ai.git
cd flowa-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `env.sample` to `.env.local` and fill in all values:

```bash
cp env.sample .env.local
```

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Model API Keys
DEEPSEEK_API_KEY=
GPT_API_KEY=
MISTRAL_API_KEY=
META_API_KEY=
GEMINI_API_KEY=

# Web Search
TAVILY_API_KEY=

# Stream (optional)
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_API_SECRET=

# Databases
DATABASE_URL=          # PostgreSQL connection string
MONGODB_URI=           # MongoDB connection string

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker

```bash
docker build -t flowa-ai .
docker run -p 3000:3000 --env-file .env.local flowa-ai
```

---

## 🔄 How It Works

1. **User submits a query** via the chat interface.
2. **Prompt Moderation** checks for malicious content. Flagged prompts are logged and the user may be banned.
3. **Should Search?** — A utility decides if the query needs fresh web data. If yes, Tavily fetches relevant results and enriches the prompt.
4. **Parallel Agent Calls** — All 5 model agents (DeepSeek, Gemini, GPT-OSS, Mistral, LLaMA) are called simultaneously.
5. **Similarity Scoring** — Local embeddings (`@xenova/transformers`) score each response against the original query. The most relevant answer is selected.
6. **Response returned** to the user. Messages are compressed (gzip) and stored in MongoDB.

---

## 📜 License

This project is private and unlicensed. All rights reserved.
