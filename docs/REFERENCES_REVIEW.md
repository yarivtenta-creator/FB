# References Review

## 1. AntraTripathi74/AI-SDR
- **Purpose**: AI-powered sales development representative pipeline
- **Useful Ideas**: Multi-stage lead qualification, AI scoring, automated draft generation
- **Useful Files**: Lead model structure, scoring logic patterns
- **What NOT to Copy**: Cloud API dependencies, multi-tenant architecture
- **Relevance Score**: 8/10

## 2. kaymen99/sales-outreach-automation-langgraph
- **Purpose**: LangGraph-based outreach automation with state machines
- **Useful Ideas**: Graph-based agent state transitions, approval workflow patterns, multi-channel outreach
- **Useful Files**: State graph definitions, agent node patterns
- **What NOT to Copy**: LangGraph dependency (adds complexity), cloud LLM calls
- **Relevance Score**: 7/10

## 3. MatthewDailey/open-sdr
- **Purpose**: Open-source SDR workflow with local data
- **Useful Ideas**: Lead pipeline stages, status tracking, simple UI patterns
- **Useful Files**: Pipeline status enum, lead data model
- **What NOT to Copy**: External CRM integrations
- **Relevance Score**: 7/10

## 4. mayooear/ai-company-researcher
- **Purpose**: AI company research and profiling tool
- **Useful Ideas**: Content analysis patterns, business profiling prompts, opportunity detection
- **Useful Files**: Research prompt templates, content summarization patterns
- **What NOT to Copy**: Paid API dependencies, scraping infrastructure
- **Relevance Score**: 6/10

## 5. filip-michalsky/SalesGPT
- **Purpose**: GPT-powered conversational sales agent
- **Useful Ideas**: Conversation stage detection, sales script generation, tone variations (soft/direct/professional)
- **Useful Files**: Stage analyzer, response generator patterns
- **What NOT to Copy**: OpenAI-only dependency, real-time conversation loop
- **Relevance Score**: 8/10

## 6. n8n-io/n8n
- **Purpose**: Workflow automation platform
- **Useful Ideas**: Node-based workflow execution, activity logging, credential management patterns
- **Useful Files**: Workflow execution engine concepts
- **What NOT to Copy**: Entire framework (massive), multi-user system
- **Relevance Score**: 3/10

## 7. n8n-io/self-hosted-ai-starter-kit
- **Purpose**: Self-hosted AI setup with Ollama
- **Useful Ideas**: Ollama integration pattern, local AI model selection, fallback to mock
- **Useful Files**: Docker compose patterns for Ollama, model pull scripts
- **What NOT to Copy**: Docker-only approach, full n8n stack
- **Relevance Score**: 6/10

## 8. ollama/ollama
- **Purpose**: Local LLM server
- **Useful Ideas**: REST API at localhost:11434, model pull/list endpoints, generate endpoint
- **Useful Files**: API documentation patterns
- **What NOT to Copy**: Core Ollama code (use as external service)
- **Relevance Score**: 9/10 (use as dependency)

## 9. open-webui/open-webui
- **Purpose**: Web UI for local LLMs
- **Useful Ideas**: Ollama API client patterns, streaming response handling, model selection UI
- **Useful Files**: Ollama client implementation
- **What NOT to Copy**: Full web framework, user auth system
- **Relevance Score**: 5/10

## 10. unclecode/crawl4AI
- **Purpose**: AI-powered web crawler
- **Useful Ideas**: Content extraction patterns, text normalization for AI analysis
- **Useful Files**: Content extraction utilities
- **What NOT to Copy**: Full crawler infrastructure, browser automation
- **Relevance Score**: 4/10

## 11. AdsPower Local API
- **Purpose**: Browser profile management via local REST API
- **Useful Ideas**: Profile CRUD operations, browser open/close lifecycle, API key auth
- **Key Endpoints**: `/api/v2/user/list`, `/api/v2/browser/start`, `/api/v2/browser/stop`
- **What NOT to Copy**: N/A — use as external service
- **Relevance Score**: 10/10 (core integration)
