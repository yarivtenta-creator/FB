# n8n Template Risk Classification

| Risk   | Meaning                                              | Allowed in v2 |
|--------|------------------------------------------------------|---------------|
| low    | No side effects, no credentials                      | register only |
| medium | Sends notifications, may need a credential           | register only |
| high   | Touches a broker / executes orders / moves money     | register, DISABLED |

v2 NEVER executes any workflow. The registry is metadata for future planning.
Anything that executes orders stays disabled and behind human approval.
