Note:
The application was built and tested successfully during development. Over time, framework updates introduced breaking changes, so the live deployment is not actively maintained. The focus of this repository is on backend architecture, AI orchestration logic, and system design choices.

Flowa AI – Multi-LLM Orchestration Platform
Project Overview

Flowa AI is a full-stack AI platform that orchestrates and aggregates responses from multiple large language models (LLMs). The system provides context-aware AI chat capabilities, handling multiple AI responses, moderation, and analytics. This project demonstrates backend architecture, AI orchestration, and database design for modern AI applications.

Features

Orchestrates multiple LLMs for a single query

Persistent chat storage for analytics and auditing

Rate limiting

Prompt safety and moderation rules

Real-time web search integration for context-aware responses

Hybrid database design using PostgreSQL and MongoDB

Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS

Backend: Node.js, Next.js API routes

Databases: PostgreSQL (Neon), MongoDB (for chat persistence)

APIs / AI Integration: Tavily API, OpenRouter, Gemini, multiple LLMs

Authentication:Clerk Auth

Architecture

Client sends query to backend via REST API

Backend receives query, validates input, and distributes it to multiple LLMs in parallel

Prompt moderation and safety checks are applied to all responses

MongoDB stores chat history asynchronously, PostgreSQL stores structured metadata, analytics, and user info

LLM outputs are aggregated, filtered, and ranked before returning the final response to the client
