# n8n Template Registry (static)

Metadata only. Stores workflow templates and their risk classification.

- No workflow execution. No webhooks. No credentials. No real services.
- High-risk templates (e.g. order routers) are registered for reference but
  marked `enabled: false` and never run by this instance.
